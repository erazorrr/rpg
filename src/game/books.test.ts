jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {BookPopup, wrapBookParagraph} from './book-popup';
import {Context} from './context';
import {Book} from './items/books/book';
import {
  BOOK_CONSTRUCTORS,
  EmberdeepProvisionLedgerBook,
  EmberkeepersAlmanacBook,
  JournalOfAdeptMarenBook,
  SevenSuppersAtTheCrookedCrownBook,
  SurveyNotesLanternSiteSevenBook,
  UNIQUE_BOOK_SAVE_IDS,
} from './items/books/books';
import {restoreItem} from './items/item.factory';
import {LootGenerator} from './loot-generator';
import {LightGoesFirstBook} from './items/books/light-goes-first';
import {Player} from './player';
import {Position} from '../io/position';
import {Renderer} from '../io/renderer';

describe('books', () => {
  const context = {} as Context;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses quoted inventory names and restores every title by stable save ID', () => {
    for (const BookConstructor of BOOK_CONSTRUCTORS) {
      const book = new BookConstructor(context);
      const restored = restoreItem(context, book.toSaveData());

      expect(book.getName()).toBe(`"${book.title}"`);
      expect(book.getCost()).toBe(0);
      expect(book.stats).toEqual({});
      expect(restored).toBeInstanceOf(BookConstructor);
      expect((restored as Book).paragraphs).toEqual(book.paragraphs);
    }
  });

  it('word-wraps prose without losing words', () => {
    const paragraph = 'One short sentence with several words.';
    const lines = wrapBookParagraph(paragraph, 12);

    expect(lines.every(line => line.length <= 12)).toBe(true);
    expect(lines.join(' ')).toBe(paragraph);
  });

  it('keeps a reflowed book popup inside its resized game field', () => {
    const positions: Position[] = [];
    const renderer = {
      put: (position: Position) => { positions.push(position); },
    } as unknown as Renderer;
    const popupContext = {getRenderer: () => renderer} as Context;
    const popup = new BookPopup(popupContext, new LightGoesFirstBook(popupContext));

    popup.resize(48, 38);
    popup.render();

    expect(positions.length).toBeGreaterThan(0);
    expect(positions.every(position => (
      position.x >= 0 && position.x < 48 && position.y >= 0 && position.y < 38
    ))).toBe(true);
  });

  it('gives the propaganda book to a new player and restores it by save ID', () => {
    const player = new Player(context, new Position(0, 0), false);
    const startingBook = player.inventory.find(item => item instanceof LightGoesFirstBook);

    expect(startingBook?.getName()).toBe('"The Light Goes First"');
    expect(restoreItem(context, startingBook!.toSaveData())).toBeInstanceOf(LightGoesFirstBook);
    expect(BOOK_CONSTRUCTORS as readonly unknown[]).not.toContain(LightGoesFirstBook);
  });

  it('can replace ordinary loot with a uniformly selected rare book', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.004)
      .mockReturnValueOnce(0.55);

    const item = new LootGenerator(context).generateLoot(10);

    expect(item).toBeInstanceOf(Book);
    expect(item).toBeInstanceOf(SevenSuppersAtTheCrookedCrownBook);
  });

  it('does not select a unique book after its save ID has been generated', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.004)
      .mockReturnValueOnce(0.35);

    const generated = new Set([SurveyNotesLanternSiteSevenBook.saveId]);
    const item = new LootGenerator(context).generateLoot(10, generated);

    expect(item).toBeInstanceOf(Book);
    expect(item).not.toBeInstanceOf(SurveyNotesLanternSiteSevenBook);
  });

  it('marks each Emberdeep manuscript as a separately tracked unique book', () => {
    const uniqueBooks = [
      new SurveyNotesLanternSiteSevenBook(context),
      new EmberdeepProvisionLedgerBook(context),
      new JournalOfAdeptMarenBook(context),
      new EmberkeepersAlmanacBook(context),
    ];

    expect(uniqueBooks.every(book => book.isUnique)).toBe(true);
    expect(new Set(uniqueBooks.map(book => book.saveId))).toEqual(UNIQUE_BOOK_SAVE_IDS);
  });
});

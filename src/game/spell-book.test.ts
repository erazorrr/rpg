const mockInputListeners: Array<{
  event: string;
  owner: object;
  callback: (key?: string) => void;
}> = [];

jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(event: string, owner: object, callback: (key?: string) => void): void {
      mockInputListeners.push({event, owner, callback});
    }

    public clear(owner: object): void {
      for (let i = mockInputListeners.length - 1; i >= 0; i--) {
        if (mockInputListeners[i].owner === owner) mockInputListeners.splice(i, 1);
      }
    }
  },
}));

import {Context} from './context';
import {GameMessage, GameMessageType} from './game-message';
import {SpellBook} from './spell-book';
import {FireBoltSpell} from './spells/fire-bolt';
import {FireLanceSpell} from './spells/fire-lance';
import {InputEvent} from '../io/input.event';
import {Renderer} from '../io/renderer';

describe('SpellBook key bindings', () => {
  beforeEach(() => mockInputListeners.splice(0));

  it('selects spells with their fixed mnemonic keys', () => {
    const messages: GameMessage[] = [];
    const fireBolt = new FireBoltSpell();
    const fireLance = new FireLanceSpell();
    const context = {
      getPlayer: () => ({knownSpells: new Set([fireBolt, fireLance])}),
      getRenderer: () => ({} as Renderer),
      postGameMessage: (message: GameMessage) => messages.push(message),
    } as unknown as Context;
    const spellBook = new SpellBook(context);

    spellBook.makeInteractive();
    const characterListener = mockInputListeners.find(listener => (
      listener.event === InputEvent.CHARACTER && listener.owner === spellBook
    ));
    characterListener?.callback('F');

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe(GameMessageType.SelectSpell);
    expect((messages[0].payload as {spell: FireLanceSpell}).spell).toBe(fireLance);
  });
});

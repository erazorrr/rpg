const inputListeners: Array<{
  event: string;
  owner: object;
  callback: () => void;
}> = [];

jest.mock('./input.emitter', () => ({
  InputEmitter: class {
    public on(event: string, owner: object, callback: () => void): void {
      inputListeners.push({event, owner, callback});
    }

    public clear(owner: object): void {
      for (let i = inputListeners.length - 1; i >= 0; i--) {
        if (inputListeners[i].owner === owner) inputListeners.splice(i, 1);
      }
    }
  },
}));

import {InputEvent} from './input.event';
import {List} from './list';
import {Position} from './position';
import {Renderer} from './renderer';

describe('List input lifecycle', () => {
  beforeEach(() => inputListeners.splice(0));

  it('does not attach duplicate listeners when made interactive twice', () => {
    const list = new List(
      'Choose',
      [
        {id: 'first', label: 'First', onSelect: () => {}},
        {id: 'second', label: 'Second', onSelect: () => {}},
        {id: 'third', label: 'Third', onSelect: () => {}},
      ],
      new Position(0, 0),
      new Position(20, 10),
    );
    const renderer = {
      clear: () => {},
      flush: () => {},
      put: () => {},
    } as unknown as Renderer;

    list.makeInteractive(renderer);
    list.makeInteractive(renderer);

    const downListeners = inputListeners.filter(listener => listener.event === InputEvent.ARROW_DOWN);
    expect(downListeners).toHaveLength(1);

    downListeners[0].callback();
    expect(list.getActiveId()).toBe('second');
  });

  it('keeps the active item visible in a short resized list', () => {
    const put = jest.fn();
    const list = new List(
      'Choose',
      Array.from({length: 6}, (_, index) => ({
        id: `${index}`,
        label: `Item ${index}`,
        onSelect: () => {},
      })),
      new Position(0, 0),
      new Position(20, 4),
    );
    const renderer = {flush: () => {}, put} as unknown as Renderer;
    list.makeInteractive(renderer);
    const down = inputListeners.find(listener => listener.event === InputEvent.ARROW_DOWN);

    down?.callback();
    down?.callback();
    down?.callback();
    list.render(renderer);

    const rendered = put.mock.calls.map(([, char]) => char.char).join('');
    expect(list.getActiveId()).toBe('3');
    expect(rendered).toContain('Item 3');
  });

  it('does not render labels beyond its content width', () => {
    const put = jest.fn();
    const list = new List(
      'Narrow',
      [{id: 'only', label: 'A very long label', onSelect: () => {}}],
      new Position(0, 0),
      new Position(7, 3),
    );
    const renderer = {flush: () => {}, put} as unknown as Renderer;

    list.render(renderer);

    const renderedChars = put.mock.calls.map(([, char]) => char.char);
    expect(renderedChars).not.toContain('l');
  });
});

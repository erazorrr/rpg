jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Context} from './context';
import {SelectTarget} from './select-target';
import {Renderer} from '../io/renderer';
import {Position} from '../io/position';
import {Char} from '../io/char';

class CapturingRenderer extends Renderer {
  private readonly characters = new Map<string, string>();

  public put(position: Position, char: Char): void {
    this.characters.set(position.serialize(), char.char);
  }

  public flush(): void {}

  public read(position: Position, length: number): string {
    let value = '';
    for (let offset = 0; offset < length; offset++) {
      value += this.characters.get(position.shift(offset, 0).serialize()) ?? '';
    }
    return value;
  }
}

describe('SelectTarget', () => {
  it('shows a message when there are no available targets', () => {
    const renderer = new CapturingRenderer();
    const context = {
      getCurrentGameLevel: () => ({getNpcs: () => []}),
      getRenderer: () => renderer,
    } as unknown as Context;

    new SelectTarget(context).render();

    expect(renderer.read(new Position(11, 6), 'No targets available.'.length)).toBe('No targets available.');
  });
});

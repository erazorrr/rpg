jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {Player} from './player';
import {FrozenState} from './states/frozen.state';

describe('frozen movement', () => {
  it('turns a movement attempt into a turn-consuming struggle', () => {
    const origin = new Position(0, 0);
    const target = new Position(1, 0);
    const tick = jest.fn();
    const log = jest.fn();
    const recordEvent = jest.fn();
    const context = {
      getCharacter: () => undefined,
      getCurrentMap: () => ({
        isNavigable: () => true,
        getTile: () => undefined,
      }),
      log,
      recordEvent,
      tick,
    } as unknown as Context;
    const player = new Player(context, origin, false);
    player.applyState(new FrozenState(10));
    log.mockClear();

    (player as unknown as {moveTo(position: Position): void}).moveTo(target);

    expect(player.position).toEqual(origin);
    expect(log).toHaveBeenCalledWith('Hero struggles against the ice!');
    expect(tick).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith('player_action', {
      action: 'struggle_frozen',
      from: origin,
      attempted: target,
    });
  });
});

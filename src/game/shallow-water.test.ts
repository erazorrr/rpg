jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {Player} from './player';
import {BurningState} from './states/burning.state';
import {FloorTile} from './tiles/floor.tile';
import {ShallowWaterTile} from './tiles/shallow-water.tile';
import {WaterTile} from './tiles/water.tile';

class MovingPlayer extends Player {
  public enter(position: Position, traversed?: Position[]): void {
    this.moveToPosition(position, traversed);
  }
}

describe('shallow water', () => {
  it('extinguishes a burning character who enters it', () => {
    const messages: string[] = [];
    const waterPosition = new Position(1, 0);
    const tiles = new Map([
      [new Position(0, 0).serialize(), new FloorTile()],
      [waterPosition.serialize(), new ShallowWaterTile()],
    ]);
    const holder: {player?: MovingPlayer} = {};
    const context = {
      getPlayer: () => holder.player!,
      getCurrentMap: () => ({getTile: (position: Position) => tiles.get(position.serialize())}),
      log: (message: string) => messages.push(message),
    } as unknown as Context;
    const player = new MovingPlayer(context, new Position(0, 0), false);
    holder.player = player;
    player.applyState(new BurningState(4, 2));

    player.enter(waterPosition);

    expect(Array.from(player.states)).toHaveLength(0);
    expect(messages).toContain('The shallow water extinguishes the flames around Hero!');
  });

  it('also extinguishes when a fast character crosses shallow water', () => {
    const waterPosition = new Position(1, 0);
    const destination = new Position(2, 0);
    const tiles = new Map([
      [waterPosition.serialize(), new ShallowWaterTile()],
      [destination.serialize(), new FloorTile()],
    ]);
    const holder: {player?: MovingPlayer} = {};
    const context = {
      getPlayer: () => holder.player!,
      getCurrentMap: () => ({getTile: (position: Position) => tiles.get(position.serialize())}),
      log: () => {},
    } as unknown as Context;
    const player = new MovingPlayer(context, new Position(0, 0), false);
    holder.player = player;
    player.applyState(new BurningState(4, 2));

    player.enter(destination, [waterPosition, destination]);

    expect(Array.from(player.states)).toHaveLength(0);
  });

  it('does not let a character standing in shallow water catch fire', () => {
    const messages: string[] = [];
    const waterPosition = new Position(1, 0);
    const water = new ShallowWaterTile();
    const holder: {player?: MovingPlayer} = {};
    const context = {
      getPlayer: () => holder.player!,
      getCurrentMap: () => ({getTile: () => water}),
      log: (message: string) => messages.push(message),
    } as unknown as Context;
    const player = new MovingPlayer(context, waterPosition, false);
    holder.player = player;

    expect(player.applyState(new BurningState(4, 2))).toBe(false);
    expect(Array.from(player.states)).toHaveLength(0);
    expect(messages).toContain('The shallow water extinguishes the flames around Hero!');
  });

  it('allows sight and projectiles across deep water', () => {
    expect(new WaterTile().isNavigable()).toBe(false);
    expect(new WaterTile().blocksLight()).toBe(false);
  });
});

jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {BackgroundColor} from '../io/background.color';
import {Position} from '../io/position';
import {Renderer} from '../io/renderer';
import {Context} from './context';
import {GameMap} from './game.map';
import {Level} from './level';
import {Player} from './player';
import {FloorTile} from './tiles/floor.tile';
import {TorchTile} from './tiles/torch.tile';
import {WallTile} from './tiles/wall.tile';

describe('map lighting', () => {
  it('shows light from an unexplored source on visible terrain', () => {
    const world: {level?: Level; player?: Player} = {};
    const context: Context = {
      getPlayer: () => world.player!,
      getCurrentMap: () => world.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: () => true,
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: () => {},
      destroyNpc: () => {},
      getCurrentGameLevel: () => world.level!,
    };
    const tiles = Array.from(
      {length: 5},
      () => Array.from({length: 5}, () => new FloorTile()),
    );
    const source = new Position(3, 3);
    const target = new Position(1, 3);
    tiles[source.x][source.y] = new TorchTile();
    tiles[2][2] = new WallTile();
    tiles[target.x][target.y].setExplored(true);

    const map = new GameMap(context, tiles, new Position(1, 1), 5, 5, 5, 5);
    world.level = new Level(1, map);
    world.player = new Player(context, new Position(1, 1), false);
    map.setContainerSize(20, 20);
    expect(map.getTopLeftCorner()).toEqual(new Position(0, 0));
    expect(world.player.canSeeTerrain(source)).toBe(false);
    expect(map.getTile(source)?.isExplored()).toBe(false);

    const put = jest.fn();
    map.render({put} as unknown as Renderer, {frame: 0, elapsedMs: 0});

    const targetCalls = put.mock.calls.filter(([position]) => position.equals(target));
    expect(targetCalls.at(-1)?.[1].backgroundColor).toBe(BackgroundColor.LightGoldenrod3);
  });

  it('does not tint a wall with light from its unseen side', () => {
    const world: {level?: Level; player?: Player} = {};
    const context: Context = {
      getPlayer: () => world.player!,
      getCurrentMap: () => world.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: () => true,
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: () => {},
      destroyNpc: () => {},
      getCurrentGameLevel: () => world.level!,
    };
    const tiles = Array.from(
      {length: 5},
      () => Array.from({length: 3}, () => new FloorTile()),
    );
    const source = new Position(1, 1);
    const target = new Position(2, 1);
    tiles[source.x][source.y] = new TorchTile();
    tiles[source.x][source.y].setExplored(true);
    tiles[target.x][target.y] = new WallTile();
    tiles[target.x][target.y].setExplored(true);

    const map = new GameMap(context, tiles, new Position(3, 1), 5, 3, 5, 3);
    world.level = new Level(1, map);
    world.player = new Player(context, new Position(3, 1), false);
    expect(world.player.canSeeTerrain(source)).toBe(false);
    expect(world.player.canSeeTerrain(target)).toBe(true);

    const put = jest.fn();
    map.render({put} as unknown as Renderer, {frame: 0, elapsedMs: 0});

    const targetCalls = put.mock.calls.filter(([position]) => position.equals(target));
    expect(targetCalls.at(-1)?.[1].backgroundColor).toBe(BackgroundColor.Grey11);
  });
});

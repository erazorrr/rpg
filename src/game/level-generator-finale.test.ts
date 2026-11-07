import {Context} from './context';
import {GameMap} from './game.map';
import {LevelGenerator} from './level-generator';
import {Level} from './level';
import {EmberGuardian} from './monsters/ember-guardian';
import {Position} from '../io/position';
import {FloorTile} from './tiles/floor.tile';
import {StairsDownTile} from './tiles/stairs-down.tile';
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {MIN_DUNGEON_NAVIGABLE_TILES} from './dungeon-generation/dungeon-validation';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

describe('LevelGenerator finale', () => {
  it('uses the bounded fallback when the organic room frontier dies early', () => {
    const world: {previousLevel?: Level} = {};
    const context = {
      getPlayer: () => null,
      getCurrentMap: () => world.previousLevel!.map,
      getCurrentGameLevel: () => world.previousLevel!,
    } as unknown as Context;
    const tiles = Array.from(
      {length: 100},
      () => Array.from({length: 100}, () => new FloorTile()),
    );
    const stairs = new Position(50, 50);
    tiles[stairs.x][stairs.y] = new StairsDownTile();
    const previousLevel = new Level(0, new GameMap(context, tiles, stairs, 100, 100, 80, 24));
    world.previousLevel = previousLevel;

    const level = new LevelGenerator(context, 80, 24, () => 0).generateLevel(1, previousLevel);
    let navigable = 0;
    for (let x = 0; x < level.map.width; x++) for (let y = 0; y < level.map.height; y++) {
      if (level.map.isNavigable(new Position(x, y))) navigable++;
    }

    expect(navigable).toBeGreaterThanOrEqual(MIN_DUNGEON_NAVIGABLE_TILES);
  });

  it('places one persistent objective and one guardian on the deepest floor', () => {
    const world: {previousLevel?: Level} = {};
    const context = {
      getPlayer: () => null,
      getCurrentMap: () => world.previousLevel!.map,
      getCurrentGameLevel: () => world.previousLevel!,
    } as unknown as Context;
    const tiles = Array.from(
      {length: 100},
      () => Array.from({length: 100}, () => new FloorTile()),
    );
    const stairs = new Position(50, 50);
    tiles[stairs.x][stairs.y] = new StairsDownTile();
    const previousLevel = new Level(2, new GameMap(context, tiles, stairs, 100, 100, 80, 24));
    world.previousLevel = previousLevel;

    const level = new LevelGenerator(context, 80, 24, seeded(1)).generateLevel(3, previousLevel);
    const emberPosition = level.findTile(DeepEmberTile);

    expect(emberPosition).not.toBeNull();
    expect(level.findTile(StairsDownTile)).toBeNull();
    expect(level.getNpcs().filter(npc => npc instanceof EmberGuardian)).toHaveLength(1);
  });
});

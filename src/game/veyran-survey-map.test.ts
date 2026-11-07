import {Context} from './context';
import {GameMap} from './game.map';
import {restoreItem} from './items/item.factory';
import {VeyranSurveyMap} from './items/veyran-survey-map';
import {Level} from './level';
import {LootGenerator} from './loot-generator';
import {FloorTile} from './tiles/floor.tile';
import {Position} from '../io/position';

describe('Veyran Survey Map', () => {
  function createWorld(levelNo = 1): {context: Context; level: Level} {
    const world: {level?: Level} = {};
    const context = {
      getCurrentMap: () => world.level!.map,
      getCurrentGameLevel: () => world.level!,
    } as Context;
    const tiles = Array.from(
      {length: 60},
      () => Array.from({length: 40}, () => new FloorTile()),
    );
    world.level = new Level(
      levelNo,
      new GameMap(context, tiles, new Position(1, 1), 60, 40, 60, 40),
    );
    return {context, level: world.level};
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reveals one large bounded patch of unexplored dungeon terrain', () => {
    const {context, level} = createWorld();
    jest.spyOn(Math, 'random').mockReturnValue(0.51);

    const revealed = new VeyranSurveyMap(context).reveal();
    let explored = 0;
    for (let x = 0; x < level.map.width; x++) {
      for (let y = 0; y < level.map.height; y++) {
        if (level.map.getTile(new Position(x, y))?.isExplored()) explored++;
      }
    }

    expect(revealed).toBe(735);
    expect(explored).toBe(revealed);
  });

  it('has no effect where fog of war is disabled', () => {
    const {context, level} = createWorld(0);

    expect(new VeyranSurveyMap(context).reveal()).toBe(0);
    expect(level.map.getTile(new Position(1, 1))?.isExplored()).toBe(false);
  });

  it('restores by stable save ID', () => {
    const {context} = createWorld();
    const map = new VeyranSurveyMap(context);

    expect(restoreItem(context, map.toSaveData())).toBeInstanceOf(VeyranSurveyMap);
  });

  it('can replace ordinary loot with a rare map', () => {
    const {context} = createWorld();
    const player = {
      inventory: [],
      getWisdom: () => 10,
      getDexterity: () => 10,
      getStrength: () => 10,
    };
    (context as unknown as {getPlayer: () => typeof player}).getPlayer = () => player;
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.009);

    expect(new LootGenerator(context).generateLoot(10)).toBeInstanceOf(VeyranSurveyMap);
  });
});

jest.mock('../../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Position} from '../../io/position';
import {Renderer} from '../../io/renderer';
import {Context} from '../context';
import {GameMap} from '../game.map';
import {Level} from '../level';
import {Player} from '../player';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {FlagstoneFloorTile} from '../tiles/flagstone-floor.tile';
import {MoldFloorTile} from '../tiles/mold-floor.tile';
import {Tile} from '../tiles/abstract.tile';
import {EmberworksFloorTile} from '../tiles/emberworks-floor.tile';
import {getDungeonBiomeAmbienceMessage, getDungeonBiomeDiscoveryMessage} from './dungeon-biomes';
import {DungeonBiome} from './dungeon-layout';

type World = {map?: GameMap; level?: Level; player?: Player};

function buildWorld(tiles: Tile[][]): {world: World; messages: string[]} {
  const world: World = {};
  const messages: string[] = [];
  const context: Context = {
    getCurrentMap: () => world.map!,
    getPlayer: () => world.player!,
    getRenderer: () => null as unknown as Renderer,
    postGameMessage: () => {},
    tick: () => {},
    getIsFree: () => true,
    buildPath: () => [],
    getCharacter: () => undefined,
    log: message => messages.push(message),
    getItem: () => undefined,
    destroyNpc: () => {},
    getCurrentGameLevel: () => world.level!,
  };
  world.map = new GameMap(context, tiles, new Position(1, 1), tiles.length, tiles[0].length, 20, 20);
  world.level = new Level(1, world.map);
  world.player = new Player(context, new Position(1, 1), false);
  return {world, messages};
}

describe('dungeon biome discovery', () => {
  it('announces each newly visible biome once per level', () => {
    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    const tiles: Tile[][] = [
      [new MoldFloorTile(), new MoldFloorTile(), new MoldFloorTile()],
      [new CaveFloorTile(), new CaveFloorTile(), new CaveFloorTile()],
      [new FlagstoneFloorTile(), new FlagstoneFloorTile(), new FlagstoneFloorTile()],
      [new EmberworksFloorTile(), new EmberworksFloorTile(), new EmberworksFloorTile()],
    ];
    const {world, messages} = buildWorld(tiles);

    world.player!.explore();
    world.player!.explore();

    expect(messages).toEqual([
      'Damp mold marks a fungal overgrowth.',
      'Rough stone opens into a cavern.',
      'Flagstones mark a castle undercroft.',
      'Brass pipes and iron grates mark the Emberworks.',
    ]);
    random.mockRestore();
  });

  it.each(Object.values(DungeonBiome))('provides varied messages for %s', biome => {
    const messages = [0, .25, .5, .75].map(roll =>
      getDungeonBiomeDiscoveryMessage(biome, () => roll));

    expect(new Set(messages).size).toBe(4);
  });

  it.each(Object.values(DungeonBiome))('provides fifteen ambient messages for %s', biome => {
    const messages = Array.from({length: 15}, (_, index) =>
      getDungeonBiomeAmbienceMessage(biome, () => (index + .5) / 15));

    expect(new Set(messages).size).toBe(15);
  });

  it('reconstructs discoveries from explored floor tiles', () => {
    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    const mold = new MoldFloorTile();
    mold.setExplored(true);
    const tiles: Tile[][] = [
      [mold, new MoldFloorTile(), new MoldFloorTile()],
      [new CaveFloorTile(), new CaveFloorTile(), new CaveFloorTile()],
      [new CaveFloorTile(), new CaveFloorTile(), new CaveFloorTile()],
    ];
    const {world, messages} = buildWorld(tiles);

    world.player!.explore();

    expect(messages).toEqual(['Rough stone opens into a cavern.']);
    random.mockRestore();
  });
});

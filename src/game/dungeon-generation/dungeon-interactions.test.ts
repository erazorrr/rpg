import {Position} from '../../io/position';
import {applyDungeonBiomes} from './dungeon-biomes';
import {addBiomeInteractions} from './dungeon-interactions';
import {DungeonBiome, generateDungeonLayout} from './dungeon-layout';
import {validateDungeonTerrain} from './dungeon-validation';
import {SporePodTile} from '../tiles/spore-pod.tile';
import {ThornFungusTile} from '../tiles/thorn-fungus.tile';
import {CrystalClusterTile} from '../tiles/crystal-cluster.tile';
import {FrostGeodeTile} from '../tiles/frost-geode.tile';
import {AshUrnTile} from '../tiles/ash-urn.tile';
import {SmokingBrazierTile} from '../tiles/smoking-brazier.tile';
import {PressureValveTile} from '../tiles/pressure-valve.tile';
import {SearingGrateTile} from '../tiles/searing-grate.tile';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

describe('biome interactions', () => {
  it('places sparse interactions without disconnecting the dungeon', () => {
    const random = seeded(71);
    const draft = generateDungeonLayout(100, 100, new Position(99, 40), random);
    const rooms = draft.regions.filter(region => region.kind === 'room');
    rooms.forEach((room, index) => {
      room.biome = [
        DungeonBiome.Fungal,
        DungeonBiome.Cavern,
        DungeonBiome.Undercroft,
        DungeonBiome.Emberworks,
      ][index % 4];
      room.districtId = index % 4;
    });
    for (const corridor of draft.regions.filter(region => region.kind === 'corridor')) {
      corridor.biome = DungeonBiome.Undercroft;
      corridor.districtId = 3;
    }
    applyDungeonBiomes(draft, random);

    const counts = addBiomeInteractions(draft, random);

    expect(counts.sporePods + counts.thornFungi).toBeGreaterThanOrEqual(2);
    expect(counts.crystalClusters + counts.frostGeodes).toBeGreaterThanOrEqual(2);
    expect(counts.ashUrns + counts.smokingBraziers).toBeGreaterThanOrEqual(2);
    expect(counts.pressureValves + counts.searingGrates).toBeGreaterThanOrEqual(2);
    expect(Object.values(counts).every(count => count > 0)).toBe(true);
    expect(() => validateDungeonTerrain(draft)).not.toThrow();

    const interactionTypes = [
      SporePodTile,
      ThornFungusTile,
      CrystalClusterTile,
      FrostGeodeTile,
      AshUrnTile,
      SmokingBrazierTile,
      PressureValveTile,
      SearingGrateTile,
    ];
    for (let x = 0; x < draft.tiles.length; x++) for (let y = 0; y < draft.tiles[0].length; y++) {
      const tile = draft.tiles[x][y];
      if (!interactionTypes.some(Type => tile instanceof Type)) continue;
      const position = new Position(x, y);
      expect(position.manhattanDistanceTo(draft.upstairs)).toBeGreaterThan(8);
      expect(position.manhattanDistanceTo(draft.downstairs)).toBeGreaterThan(8);
    }
  });
});

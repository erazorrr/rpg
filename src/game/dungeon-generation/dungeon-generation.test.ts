import {Position} from '../../io/position';
import {StatueTile} from '../tiles/statue.tile';
import {applyDungeonBiomes, assignDungeonBiomes, weightedChoice} from './dungeon-biomes';
import {DungeonBiome, generateDungeonLayout, generateGuaranteedDungeonLayout} from './dungeon-layout';
import {addTreasureRooms, decorateDungeon} from './dungeon-structures';
import {countNavigableTiles, MIN_DUNGEON_NAVIGABLE_TILES, validateDungeonTerrain} from './dungeon-validation';
import {LootChestTile} from '../tiles/loot-chest.tile';
import {CrystalSeamTile} from '../tiles/crystal-seam.tile';
import {GlowingMushroomTile} from '../tiles/glowing-mushroom.tile';
import {HeatGrateTile} from '../tiles/heat-grate.tile';
import {MosaicFloorTile} from '../tiles/mosaic-floor.tile';
import {addRareUndergroundLake} from './dungeon-lakes';
import {addRareDungeonPattern} from './dungeon-patterns';
import {addBiomeInteractions} from './dungeon-interactions';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

describe('dungeon generation', () => {
  it('supports weighted tables whose totals are not 100', () => {
    expect(weightedChoice([['first', 90], ['last', 35]], () => .99)).toBe('last');
    expect(weightedChoice([['first', 1], ['last', 1]], () => 0)).toBe('first');
  });

  it.each([1, 2, 3])('keeps level %i connected and biome-diverse', depth => {
    for (let seed = 1; seed <= 3; seed++) {
      const random = seeded(seed);
      const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
      assignDungeonBiomes(draft, depth, random);
      applyDungeonBiomes(draft, random);
      expect(decorateDungeon(draft, depth, random)).toBeGreaterThan(0);
      expect(new Set(draft.regions.map(region => region.biome)).size).toBeGreaterThanOrEqual(2);
      expect(() => validateDungeonTerrain(draft)).not.toThrow();
    }
  });

  it('keeps the Emberworks rare and below the first dungeon floor', () => {
    let foundOnSecondFloor = false;
    for (let seed = 1; seed <= 20; seed++) {
      const firstRandom = seeded(seed);
      const first = generateDungeonLayout(80, 80, new Position(79, 30), firstRandom);
      assignDungeonBiomes(first, 1, firstRandom);
      expect(first.regions.some(region => region.biome === DungeonBiome.Emberworks)).toBe(false);

      const secondRandom = seeded(seed);
      const second = generateDungeonLayout(80, 80, new Position(79, 30), secondRandom);
      assignDungeonBiomes(second, 2, secondRandom);
      foundOnSecondFloor ||= second.regions.some(region => region.biome === DungeonBiome.Emberworks);
    }
    expect(foundOnSecondFloor).toBe(true);
  });

  it('measures final navigable area after terrain and structures', () => {
    const random = seeded(1);
    const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
    assignDungeonBiomes(draft, 2, random);
    applyDungeonBiomes(draft, random);
    decorateDungeon(draft, 2, random);
    expect(countNavigableTiles(draft)).toBeGreaterThanOrEqual(MIN_DUNGEON_NAVIGABLE_TILES);
  });

  it('does not repeat statue inscriptions on the same floor', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const random = seeded(seed);
      const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
      assignDungeonBiomes(draft, 2, random);
      applyDungeonBiomes(draft, random);
      decorateDungeon(draft, 2, random);
      const inscriptionIds = draft.tiles
        .flat()
        .filter((tile): tile is StatueTile => tile instanceof StatueTile)
        .map(tile => tile.inscriptionId);

      expect(new Set(inscriptionIds).size).toBe(inscriptionIds.length);
    }
  });

  it('does not repeat statue inscriptions across floors', () => {
    const used = new Set<import('../tiles/statue-inscriptions').StatueInscriptionId>();
    for (let depth = 1; depth <= 3; depth++) {
      const random = seeded(depth);
      const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
      assignDungeonBiomes(draft, depth, random);
      applyDungeonBiomes(draft, random);
      decorateDungeon(draft, depth, random, used);
      const inscriptionIds = draft.tiles
        .flat()
        .filter((tile): tile is StatueTile => tile instanceof StatueTile)
        .map(tile => tile.inscriptionId);

      expect(inscriptionIds.every(id => !used.has(id))).toBe(true);
      inscriptionIds.forEach(id => used.add(id));
    }
  });

  it('reserves exactly two dedicated, connected treasure rooms', () => {
    const random = seeded(27);
    const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
    assignDungeonBiomes(draft, 2, random);
    applyDungeonBiomes(draft, random);

    expect(addTreasureRooms(draft, random, () => new LootChestTile('sturdy', []))).toBe(2);
    expect(draft.regions.filter(region => region.purpose === 'treasure')).toHaveLength(2);
    expect(draft.tiles.flat().filter(tile => tile instanceof LootChestTile)).toHaveLength(2);
    expect(() => validateDungeonTerrain(draft)).not.toThrow();

    decorateDungeon(draft, 2, random);
    expect(draft.tiles.flat().filter(tile => tile instanceof LootChestTile)).toHaveLength(2);
  });

  it('scales navigable visual accents with represented biome districts', () => {
    const random = seeded(41);
    const draft = generateDungeonLayout(200, 200, new Position(199, 50), random);
    assignDungeonBiomes(draft, 2, random);
    applyDungeonBiomes(draft, random);
    const accentTypes = [GlowingMushroomTile, CrystalSeamTile, MosaicFloorTile, HeatGrateTile];
    const accents = draft.tiles.flat().filter(tile => accentTypes.some(Type => tile instanceof Type));
    const representedDistricts = new Set(draft.regions.map(region => region.districtId));

    expect(accents.length).toBeGreaterThanOrEqual(representedDistricts.size * 3);
    expect(accents.length).toBeLessThanOrEqual(representedDistricts.size * 12);
    expect(accents.every(tile => tile!.isNavigable())).toBe(true);
  });

  it.each([new Position(199, 50), new Position(0, 0)])(
    'builds a guaranteed connected fallback from stairs at %s',
    upstairs => {
      const random = () => 0;
      const draft = generateGuaranteedDungeonLayout(200, 200, upstairs, MIN_DUNGEON_NAVIGABLE_TILES + 256);
      assignDungeonBiomes(draft, 2, random);
      applyDungeonBiomes(draft, random);
      addRareUndergroundLake(draft, random);
      expect(addTreasureRooms(draft, random, () => new LootChestTile('sturdy', []))).toBe(2);
      addRareDungeonPattern(draft, random);
      decorateDungeon(draft, 2, random);
      addBiomeInteractions(draft, random);

      expect(() => validateDungeonTerrain(draft)).not.toThrow();
      expect(countNavigableTiles(draft)).toBeGreaterThanOrEqual(MIN_DUNGEON_NAVIGABLE_TILES);
    },
  );
});

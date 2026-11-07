import {BarricadeTile} from './barricade.tile';
import {CaveFloorTile} from './cave-floor.tile';
import {DeadBrazierTile} from './dead-brazier.tile';
import {FlagstoneFloorTile} from './flagstone-floor.tile';
import {GlowingMushroomTile} from './glowing-mushroom.tile';
import {MasonryWallTile} from './masonry-wall.tile';
import {MoldFloorTile} from './mold-floor.tile';
import {MossWallTile} from './moss-wall.tile';
import {restoreTile} from './tile.factory';
import {RoughWallTile} from './rough-wall.tile';
import {RubbleTile} from './rubble.tile';
import {StonePillarTile} from './stone-pillar.tile';
import {DeepEmberTile} from './deep-ember.tile';
import {EmberworksFloorTile} from './emberworks-floor.tile';
import {PipeWallTile} from './pipe-wall.tile';
import {CrystalSeamTile} from './crystal-seam.tile';
import {MosaicFloorTile} from './mosaic-floor.tile';
import {HeatGrateTile} from './heat-grate.tile';
import {SporePodTile} from './spore-pod.tile';
import {CrystalClusterTile} from './crystal-cluster.tile';
import {PressureValveTile} from './pressure-valve.tile';
import {ThornFungusTile} from './thorn-fungus.tile';
import {FrostGeodeTile} from './frost-geode.tile';
import {AshUrnTile} from './ash-urn.tile';
import {SearingGrateTile} from './searing-grate.tile';
import {OldRoadTile} from './old-road.tile';
import {VeyranWaystoneTile} from './veyran-waystone.tile';
import {SmokingBrazierTile} from './smoking-brazier.tile';
import {WaterTile} from './water.tile';
import {MistSeepTile} from './mist-seep.tile';
import {SteamFissureTile} from './steam-fissure.tile';
import {BareEarthTile} from './bare-earth.tile';
import {WoodenWallTile} from './wooden-wall.tile';

describe('dungeon tile persistence', () => {
  it('round-trips every simple dungeon tile with exploration and blood', () => {
    const tiles = [
      new MoldFloorTile(), new CaveFloorTile(), new FlagstoneFloorTile(),
      new MossWallTile(), new RoughWallTile(), new MasonryWallTile(),
      new RubbleTile(), new StonePillarTile(), new BarricadeTile(),
      new DeadBrazierTile(), new GlowingMushroomTile(), new DeepEmberTile(),
      new EmberworksFloorTile(), new PipeWallTile(),
      new CrystalSeamTile(), new MosaicFloorTile(), new HeatGrateTile(),
      new SporePodTile(), new CrystalClusterTile(), new PressureValveTile(true),
      new ThornFungusTile(), new FrostGeodeTile(), new AshUrnTile(), new SearingGrateTile(),
      new OldRoadTile(), new VeyranWaystoneTile(), new BareEarthTile(), new WoodenWallTile(),
      new SmokingBrazierTile(), new WaterTile(),
    ];
    for (const tile of tiles) {
      tile.setExplored(true);
      tile.setBloody(true);
      const restored = restoreTile(tile.toSaveData());
      expect(restored.saveId).toBe(tile.saveId);
      expect(restored.isExplored()).toBe(true);
      expect(restored.getIsBloody()).toBe(true);
    }
  });

  it('preserves a spent pressure valve', () => {
    const restored = restoreTile(new PressureValveTile(true).toSaveData()) as PressureValveTile;
    expect(restored.isSpent()).toBe(true);
  });

  it('preserves stable obstacle descriptions', () => {
    const tiles = [
      new BarricadeTile('stacked-scrap'),
      new RubbleTile('broken-masonry'),
      new StonePillarTile('soot-stained'),
      new DeadBrazierTile('melted-tallow'),
      new SmokingBrazierTile('red-coals'),
      new PipeWallTile('mineral-stains'),
      new WaterTile('cold-current'),
    ];

    for (const tile of tiles) {
      const restored = restoreTile(tile.toSaveData());
      expect(restored.getBumpMessages()).toEqual(tile.getBumpMessages());
      expect(restored.toSaveData().bumpDescriptionId).toBe(tile.toSaveData().bumpDescriptionId);
    }
  });

  it('rejects unknown obstacle descriptions', () => {
    expect(() => restoreTile({
      kind: 'barricade', explored: true, bloody: false, bumpDescriptionId: 'unknown',
    })).toThrow('Unknown barricade description');
  });

  it('preserves stable step descriptions and whether they were shown', () => {
    const tiles = [
      new GlowingMushroomTile('earthy-scent'),
      new CrystalSeamTile('metallic-taste'),
      new MosaicFloorTile('hollow-click'),
      new HeatGrateTile('slow-pulse'),
      new SteamFissureTile('mineral-scent'),
      new MistSeepTile('clammy-cold'),
      new VeyranWaystoneTile('lichen-scent'),
    ];

    for (const tile of tiles) {
      tile.markStepMessagesShown();
      const restored = restoreTile(tile.toSaveData());
      expect(restored.getStepMessages()).toEqual(tile.getStepMessages());
      expect(restored.toSaveData().stepDescriptionId).toBe(tile.toSaveData().stepDescriptionId);
      expect(restored.hasShownStepMessages()).toBe(true);
    }
  });

  it('rejects unknown step descriptions', () => {
    expect(() => restoreTile({
      kind: 'glowing-mushroom', explored: true, bloody: false, stepDescriptionId: 'unknown',
    })).toThrow('Unknown glowing mushroom description');
  });
});

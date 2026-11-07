import {TileSave} from "../save-data";
import {Tile} from "./abstract.tile";
import {ExitTile} from "./exit.tile";
import {FloorTile} from "./floor.tile";
import {GrassTile} from "./grass.tile";
import {ShallowWaterTile} from "./shallow-water.tile";
import {StairsDownTile} from "./stairs-down.tile";
import {StairsUpTile} from "./stairs-up.tile";
import {TorchTile} from "./torch.tile";
import {TreeTile} from "./tree.tile";
import {WallTile} from "./wall.tile";
import {WaterTile} from "./water.tile";
import {BarricadeTile} from './barricade.tile';
import {CaveFloorTile} from './cave-floor.tile';
import {DeadBrazierTile} from './dead-brazier.tile';
import {FlagstoneFloorTile} from './flagstone-floor.tile';
import {GlowingMushroomTile} from './glowing-mushroom.tile';
import {MasonryWallTile} from './masonry-wall.tile';
import {MoldFloorTile} from './mold-floor.tile';
import {MossWallTile} from './moss-wall.tile';
import {RoughWallTile} from './rough-wall.tile';
import {RubbleTile} from './rubble.tile';
import {StatueTile} from './statue.tile';
import {isStatueInscriptionId} from './statue-inscriptions';
import {isStatueVariantId, StatueVariantId} from './statue-variants';
import {StonePillarTile} from './stone-pillar.tile';
import {DeepEmberTile} from './deep-ember.tile';
import {MistSeepTile} from './mist-seep.tile';
import {SteamFissureTile} from './steam-fissure.tile';
import {SmokingBrazierTile} from './smoking-brazier.tile';
import {EmberworksFloorTile} from './emberworks-floor.tile';
import {PipeWallTile} from './pipe-wall.tile';
import {Context} from '../context';
import {isLootChestRarity, LootChestTile} from './loot-chest.tile';
import {restoreItem} from '../items/item.factory';
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
import {BareEarthTile} from './bare-earth.tile';
import {WoodenWallTile} from './wooden-wall.tile';

type TileConstructor = (new () => Tile) & {readonly saveId: string};
type TileRegistration = {saveId: string; create: (data: TileSave, context?: Context) => Tile};

const tileConstructors: TileConstructor[] = [
  ExitTile,
  FloorTile,
  GrassTile,
  ShallowWaterTile,
  StairsDownTile,
  StairsUpTile,
  TorchTile,
  TreeTile,
  WallTile,
  WaterTile,
  BarricadeTile, CaveFloorTile, DeadBrazierTile, FlagstoneFloorTile,
  GlowingMushroomTile, MasonryWallTile, MoldFloorTile, MossWallTile,
  RoughWallTile, RubbleTile, StonePillarTile,
  DeepEmberTile,
  MistSeepTile, SteamFissureTile, SmokingBrazierTile,
  EmberworksFloorTile, PipeWallTile,
  CrystalSeamTile, MosaicFloorTile, HeatGrateTile,
  SporePodTile, CrystalClusterTile,
  ThornFungusTile, FrostGeodeTile, AshUrnTile, SearingGrateTile,
  OldRoadTile, VeyranWaystoneTile, BareEarthTile, WoodenWallTile,
];

const registrations = new Map<string, TileRegistration>();
for (const Constructor of tileConstructors) {
  if (registrations.has(Constructor.saveId)) {
    throw new Error(`Duplicate tile save ID: ${Constructor.saveId}`);
  }
  registrations.set(Constructor.saveId, {saveId: Constructor.saveId, create: () => new Constructor()});
}
registrations.set(StatueTile.saveId, {saveId: StatueTile.saveId, create: data => {
  if (!isStatueInscriptionId(data.inscriptionId)) throw new Error(`Unknown statue inscription: ${data.inscriptionId}`);
  let variantId: StatueVariantId = 'weathered-stone';
  if (data.statueVariantId !== undefined) {
    if (!isStatueVariantId(data.statueVariantId)) throw new Error(`Unknown statue variant: ${data.statueVariantId}`);
    variantId = data.statueVariantId;
  }
  return new StatueTile(data.inscriptionId, variantId);
}});
registrations.set(LootChestTile.saveId, {saveId: LootChestTile.saveId, create: (data, context) => {
  if (!context) throw new Error('Loot chests require a game context to restore');
  if (!data.lootChest || !isLootChestRarity(data.lootChest.rarity)) {
    throw new Error('Invalid loot chest save data');
  }
  return new LootChestTile(
    data.lootChest.rarity,
    data.lootChest.items.map(item => restoreItem(context, item)),
  );
}});
registrations.set(PressureValveTile.saveId, {saveId: PressureValveTile.saveId, create: data => {
  if (typeof data.pressureValveSpent !== 'boolean') throw new Error('Invalid pressure valve save data');
  return new PressureValveTile(data.pressureValveSpent);
}});
registrations.set(BarricadeTile.saveId, {saveId: BarricadeTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new BarricadeTile();
  if (!BarricadeTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown barricade description');
  return new BarricadeTile(data.bumpDescriptionId);
}});
registrations.set(RubbleTile.saveId, {saveId: RubbleTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new RubbleTile();
  if (!RubbleTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown rubble description');
  return new RubbleTile(data.bumpDescriptionId);
}});
registrations.set(StonePillarTile.saveId, {saveId: StonePillarTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new StonePillarTile();
  if (!StonePillarTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown stone pillar description');
  return new StonePillarTile(data.bumpDescriptionId);
}});
registrations.set(DeadBrazierTile.saveId, {saveId: DeadBrazierTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new DeadBrazierTile();
  if (!DeadBrazierTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown dead brazier description');
  return new DeadBrazierTile(data.bumpDescriptionId);
}});
registrations.set(SmokingBrazierTile.saveId, {saveId: SmokingBrazierTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new SmokingBrazierTile();
  if (!SmokingBrazierTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown smoking brazier description');
  return new SmokingBrazierTile(data.bumpDescriptionId);
}});
registrations.set(PipeWallTile.saveId, {saveId: PipeWallTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new PipeWallTile();
  if (!PipeWallTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown pipe wall description');
  return new PipeWallTile(data.bumpDescriptionId);
}});
registrations.set(WaterTile.saveId, {saveId: WaterTile.saveId, create: data => {
  if (data.bumpDescriptionId === undefined) return new WaterTile();
  if (!WaterTile.isDescriptionId(data.bumpDescriptionId)) throw new Error('Unknown water description');
  return new WaterTile(data.bumpDescriptionId);
}});
registrations.set(GlowingMushroomTile.saveId, {saveId: GlowingMushroomTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new GlowingMushroomTile();
  if (!GlowingMushroomTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown glowing mushroom description');
  return new GlowingMushroomTile(data.stepDescriptionId);
}});
registrations.set(CrystalSeamTile.saveId, {saveId: CrystalSeamTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new CrystalSeamTile();
  if (!CrystalSeamTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown crystal seam description');
  return new CrystalSeamTile(data.stepDescriptionId);
}});
registrations.set(MosaicFloorTile.saveId, {saveId: MosaicFloorTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new MosaicFloorTile();
  if (!MosaicFloorTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown mosaic floor description');
  return new MosaicFloorTile(data.stepDescriptionId);
}});
registrations.set(HeatGrateTile.saveId, {saveId: HeatGrateTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new HeatGrateTile();
  if (!HeatGrateTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown heat grate description');
  return new HeatGrateTile(data.stepDescriptionId);
}});
registrations.set(SteamFissureTile.saveId, {saveId: SteamFissureTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new SteamFissureTile();
  if (!SteamFissureTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown steam fissure description');
  return new SteamFissureTile(data.stepDescriptionId);
}});
registrations.set(MistSeepTile.saveId, {saveId: MistSeepTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new MistSeepTile();
  if (!MistSeepTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown mist seep description');
  return new MistSeepTile(data.stepDescriptionId);
}});
registrations.set(VeyranWaystoneTile.saveId, {saveId: VeyranWaystoneTile.saveId, create: data => {
  if (data.stepDescriptionId === undefined) return new VeyranWaystoneTile();
  if (!VeyranWaystoneTile.isDescriptionId(data.stepDescriptionId)) throw new Error('Unknown Veyran waystone description');
  return new VeyranWaystoneTile(data.stepDescriptionId);
}});

export const knownTileSaveIds = new Set(registrations.keys());

export function restoreTile(data: TileSave, context?: Context): Tile {
  const registration = registrations.get(data.kind);
  if (!registration) throw new Error(`Unknown tile: ${data.kind}`);
  const tile = registration.create(data, context);
  tile.setExplored(data.explored);
  tile.setBloody(data.bloody);
  if (data.stepMessagesShown) tile.markStepMessagesShown();
  return tile;
}

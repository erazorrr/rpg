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
import {StonePillarTile} from './stone-pillar.tile';

type TileConstructor = (new () => Tile) & {readonly saveId: string};
type TileRegistration = {saveId: string; create: (data: TileSave) => Tile};

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
  return new StatueTile(data.inscriptionId);
}});

export const knownTileSaveIds = new Set(registrations.keys());

export function restoreTile(data: TileSave): Tile {
  const registration = registrations.get(data.kind);
  if (!registration) throw new Error(`Unknown tile: ${data.kind}`);
  const tile = registration.create(data);
  tile.setExplored(data.explored);
  tile.setBloody(data.bloody);
  return tile;
}

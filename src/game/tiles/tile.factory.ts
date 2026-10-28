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

type TileConstructor = (new () => Tile) & {readonly saveId: string};

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
];

const constructors = new Map<string, TileConstructor>();
for (const Constructor of tileConstructors) {
  if (constructors.has(Constructor.saveId)) {
    throw new Error(`Duplicate tile save ID: ${Constructor.saveId}`);
  }
  constructors.set(Constructor.saveId, Constructor);
}

export function restoreTile(data: TileSave): Tile {
  const Constructor = constructors.get(data.kind);
  if (!Constructor) throw new Error(`Unknown tile: ${data.kind}`);
  const tile = new Constructor();
  tile.setExplored(data.explored);
  tile.setBloody(data.bloody);
  return tile;
}

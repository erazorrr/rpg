import {Position} from '../../io/position';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {ShallowWaterTile} from '../tiles/shallow-water.tile';
import {WaterTile} from '../tiles/water.tile';
import {DungeonBiome, DungeonDraft, Random} from './dungeon-layout';

export const UNDERGROUND_LAKE_CHANCE = .15;

export type UndergroundLake = {
  deepWater: Position[];
  shallowWater: Position[];
  islands: Position[];
  hasFord: boolean;
};

const RADIUS_X = 4;
const RADIUS_Y = 3;

function lakeCells(center: Position): Position[] {
  const cells: Position[] = [];
  for (let dx = -RADIUS_X; dx <= RADIUS_X; dx++) {
    for (let dy = -RADIUS_Y; dy <= RADIUS_Y; dy++) {
      const distance = (dx * dx) / (RADIUS_X * RADIUS_X) + (dy * dy) / (RADIUS_Y * RADIUS_Y);
      const roughEdge = ((center.x + dx) * 17 + (center.y + dy) * 31) % 5 === 0 ? .08 : 0;
      if (distance <= 1 - roughEdge) cells.push(center.shift(dx, dy));
    }
  }
  return cells;
}

function candidateCenters(draft: DungeonDraft, hasFord: boolean): Position[] {
  const result: Position[] = [];
  const rooms = draft.regions.filter(region => region.kind === 'room' && region.biome === DungeonBiome.Cavern);
  for (const room of rooms) {
    for (let x = room.topLeft.x + RADIUS_X; x <= room.bottomRight.x - RADIUS_X; x++) {
      for (let y = room.topLeft.y + RADIUS_Y; y <= room.bottomRight.y - RADIUS_Y; y++) {
        const center = new Position(x, y);
        const cells = lakeCells(center);
        if (cells.some(position => !draft.tiles[position.x]?.[position.y]?.isNavigable())) continue;
        if (!hasFord && cells.some(position => draft.reserved.has(position.serialize()))) continue;
        result.push(center);
      }
    }
  }
  return result;
}

export function addRareUndergroundLake(draft: DungeonDraft, random: Random): UndergroundLake | null {
  if (random() >= UNDERGROUND_LAKE_CHANCE) return null;

  const hasFord = random() < .5;
  const hasIsland = random() < .35;
  const centers = candidateCenters(draft, hasFord);
  if (!centers.length) return null;
  const center = centers[Math.floor(random() * centers.length)];
  const cells = lakeCells(center);
  const cellIds = new Set(cells.map(position => position.serialize()));
  const shallowIds = new Set<string>();

  for (const position of cells) {
    const dx = position.x - center.x;
    const dy = position.y - center.y;
    const distance = (dx * dx) / (RADIUS_X * RADIUS_X) + (dy * dy) / (RADIUS_Y * RADIUS_Y);
    if (distance > .48 || draft.reserved.has(position.serialize())) shallowIds.add(position.serialize());
  }

  if (hasFord) {
    const horizontal = random() < .5;
    for (let offset = horizontal ? -RADIUS_X : -RADIUS_Y; offset <= (horizontal ? RADIUS_X : RADIUS_Y); offset++) {
      const position = horizontal ? center.shift(offset, 0) : center.shift(0, offset);
      if (cellIds.has(position.serialize())) shallowIds.add(position.serialize());
    }
  }

  const islands: Position[] = [];
  if (hasIsland) {
    const island = center.shift(random() < .5 ? -1 : 1, 0);
    islands.push(island);
    shallowIds.delete(island.serialize());
    const direction = island.x < center.x ? -1 : 1;
    for (let x = island.x + direction; Math.abs(x - center.x) <= RADIUS_X; x += direction) {
      const position = new Position(x, island.y);
      if (!cellIds.has(position.serialize())) break;
      shallowIds.add(position.serialize());
    }
  }

  const deepWater: Position[] = [];
  const shallowWater: Position[] = [];
  const water = WaterTile.withRandomDescription(random);
  for (const position of cells) {
    if (islands.some(island => island.equals(position))) {
      draft.tiles[position.x][position.y] = new CaveFloorTile();
    } else if (shallowIds.has(position.serialize())) {
      draft.tiles[position.x][position.y] = new ShallowWaterTile();
      shallowWater.push(position);
    } else {
      draft.tiles[position.x][position.y] = new WaterTile(water.descriptionId);
      deepWater.push(position);
    }
  }

  return {deepWater, shallowWater, islands, hasFord};
}

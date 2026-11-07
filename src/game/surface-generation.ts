import {Position, SerializedPosition} from '../io/position';
import {BareEarthTile} from './tiles/bare-earth.tile';
import {GrassTile} from './tiles/grass.tile';
import {StairsDownTile} from './tiles/stairs-down.tile';
import {Tile} from './tiles/abstract.tile';
import {TreeTile} from './tiles/tree.tile';
import {WoodenWallTile} from './tiles/wooden-wall.tile';

export type SurfaceDraft = {
  tiles: Tile[][];
  initialPosition: Position;
  entrancePosition: Position;
  freeTiles: Position[];
  road: ReadonlySet<SerializedPosition>;
};

export const SURFACE_WIDTH = 160;
export const SURFACE_HEIGHT = 72;

type Random = () => number;

function randomInteger(random: Random, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function inBounds(position: Position): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < SURFACE_WIDTH && position.y < SURFACE_HEIGHT;
}

function generateOpenWoodland(random: Random): Tile[][] {
  let trees = Array.from(
    {length: SURFACE_WIDTH},
    () => Array.from({length: SURFACE_HEIGHT}, () => random() < .48),
  );
  for (let pass = 0; pass < 3; pass++) {
    const next = trees.map(column => column.slice());
    for (let x = 1; x < SURFACE_WIDTH - 1; x++) for (let y = 1; y < SURFACE_HEIGHT - 1; y++) {
      let nearbyTrees = 0;
      for (let offsetX = -1; offsetX <= 1; offsetX++) for (let offsetY = -1; offsetY <= 1; offsetY++) {
        if ((offsetX !== 0 || offsetY !== 0) && trees[x + offsetX][y + offsetY]) nearbyTrees++;
      }
      if (nearbyTrees >= 5) next[x][y] = true;
      else if (nearbyTrees <= 3) next[x][y] = false;
    }
    trees = next;
  }

  let northDepth = 2;
  let southDepth = 2;
  for (let x = 0; x < SURFACE_WIDTH; x++) {
    if (random() < .3) northDepth = clamp(northDepth + randomInteger(random, -1, 1), 1, 4);
    if (random() < .3) southDepth = clamp(southDepth + randomInteger(random, -1, 1), 1, 4);
    for (let y = 0; y < northDepth; y++) trees[x][y] = true;
    for (let y = SURFACE_HEIGHT - southDepth; y < SURFACE_HEIGHT; y++) trees[x][y] = true;
  }
  for (let y = 0; y < SURFACE_HEIGHT; y++) {
    trees[0][y] = true;
    trees[SURFACE_WIDTH - 1][y] = true;
  }

  return trees.map(column => column.map(tree => tree ? new TreeTile() : new GrassTile() as Tile));
}

function carveDirt(tiles: Tile[][], trail: Set<SerializedPosition>, position: Position): void {
  if (!inBounds(position)) return;
  tiles[position.x][position.y] = new BareEarthTile();
  trail.add(position.serialize());
}

function carveTrail(
  tiles: Tile[][],
  initialPosition: Position,
  shackDoor: Position,
  random: Random,
): Set<SerializedPosition> {
  const trail = new Set<SerializedPosition>();
  let y = initialPosition.y;
  let destinationY = y;
  for (let x = 0; x <= shackDoor.x; x++) {
    if (x >= initialPosition.x && (x - initialPosition.x) % 14 === 0) {
      const progress = (x - initialPosition.x) / (shackDoor.x - initialPosition.x);
      const directY = Math.round(initialPosition.y + (shackDoor.y - initialPosition.y) * progress);
      destinationY = clamp(directY + randomInteger(random, -5, 5), 8, SURFACE_HEIGHT - 9);
    }
    if (y < destinationY) y++;
    else if (y > destinationY) y--;
    for (let pathY = y - 1; pathY <= y + 1; pathY++) carveDirt(tiles, trail, new Position(x, pathY));

    if (x >= 24 && x <= shackDoor.x - 16 && x % 24 === 0) {
      const center = new Position(x, y);
      for (let clearingX = center.x - 4; clearingX <= center.x + 4; clearingX++) {
        for (let clearingY = center.y - 3; clearingY <= center.y + 3; clearingY++) {
          const normalized = Math.pow((clearingX - center.x) / 4, 2) + Math.pow((clearingY - center.y) / 3, 2);
          if (normalized <= 1) carveDirt(tiles, trail, new Position(clearingX, clearingY));
        }
      }
    }
  }

  while (y !== shackDoor.y) {
    y += y < shackDoor.y ? 1 : -1;
    for (let pathX = shackDoor.x - 1; pathX <= shackDoor.x + 1; pathX++) {
      carveDirt(tiles, trail, new Position(pathX, y));
    }
  }
  return trail;
}

function addShack(
  tiles: Tile[][],
  trail: Set<SerializedPosition>,
  stairs: Position,
): void {
  const left = stairs.x - 8;
  const right = stairs.x + 3;
  const top = stairs.y - 4;
  const bottom = stairs.y + 4;
  const door = new Position(left, stairs.y);

  for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
    const position = new Position(x, y);
    const boundary = x === left || x === right || y === top || y === bottom;
    if (boundary && !position.equals(door)) {
      tiles[x][y] = new WoodenWallTile();
      trail.delete(position.serialize());
    } else carveDirt(tiles, trail, position);
  }
  for (let x = door.x; x <= stairs.x; x++) carveDirt(tiles, trail, new Position(x, stairs.y));
  tiles[stairs.x][stairs.y] = new StairsDownTile();
  trail.add(stairs.serialize());
}

export function generateSurfaceDraft(random: Random): SurfaceDraft {
  const initialPosition = new Position(8, Math.floor(SURFACE_HEIGHT / 2));
  const entrancePosition = new Position(SURFACE_WIDTH - 7, randomInteger(random, 13, SURFACE_HEIGHT - 14));
  const tiles = generateOpenWoodland(random);
  const shackDoor = new Position(entrancePosition.x - 8, entrancePosition.y);
  const road = carveTrail(tiles, initialPosition, shackDoor, random);
  addShack(tiles, road, entrancePosition);

  const freeTiles: Position[] = [];
  for (let x = 0; x < SURFACE_WIDTH; x++) for (let y = 0; y < SURFACE_HEIGHT; y++) {
    tiles[x][y].setExplored(true);
    const position = new Position(x, y);
    if (tiles[x][y].isNavigable() && !position.equals(initialPosition) && !position.equals(entrancePosition)) freeTiles.push(position);
  }
  return {tiles, initialPosition, entrancePosition, freeTiles, road};
}

export function selectSurfaceNpcPositions(
  freeTiles: readonly Position[],
  initialPosition: Position,
  entrancePosition: Position,
  road: ReadonlySet<SerializedPosition>,
  random: Random,
): Position[] {
  const stages: Array<[number, number]> = [
    [.10, .17], [.20, .28], [.28, .36], [.36, .44], [.44, .52], [.52, .60],
    [.60, .68], [.68, .75], [.75, .82], [.82, .88], [.87, .92],
  ];
  const journey = entrancePosition.x - initialPosition.x;
  const positions: Position[] = [];
  for (const [minimumProgress, maximumProgress] of stages) {
    const minimumX = initialPosition.x + Math.floor(journey * minimumProgress);
    const maximumX = initialPosition.x + Math.ceil(journey * maximumProgress);
    let candidates = freeTiles.filter(candidate =>
      road.has(candidate.serialize()) &&
      candidate.x >= minimumX && candidate.x <= maximumX &&
      candidate.manhattanDistanceTo(entrancePosition) >= 15 &&
      positions.every(position => candidate.manhattanDistanceTo(position) >= 7),
    );
    if (candidates.length === 0) {
      candidates = freeTiles.filter(candidate =>
        road.has(candidate.serialize()) &&
        candidate.x >= minimumX && candidate.x <= maximumX &&
        candidate.manhattanDistanceTo(entrancePosition) >= 15 &&
        positions.every(position => !candidate.equals(position)),
      );
    }
    if (candidates.length === 0) throw new Error('Surface dirt trail has too few positions for its encounters');
    positions.push(candidates[Math.floor(random() * candidates.length)]);
  }
  return positions;
}

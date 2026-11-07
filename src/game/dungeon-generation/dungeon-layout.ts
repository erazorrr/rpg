import {Position, SerializedPosition} from '../../io/position';
import {FloorTile} from '../tiles/floor.tile';
import {StairsDownTile} from '../tiles/stairs-down.tile';
import {StairsUpTile} from '../tiles/stairs-up.tile';
import {Tile} from '../tiles/abstract.tile';

export type Random = () => number;
export enum DungeonBiome {
  Fungal = 'fungal',
  Cavern = 'cavern',
  Undercroft = 'undercroft',
  Emberworks = 'emberworks',
}
export type DungeonRegion = {
  id: number; kind: 'room' | 'corridor'; topLeft: Position; bottomRight: Position;
  floor: Position[]; entrances: Position[]; neighbours: number[]; anchor: Position;
  biome?: DungeonBiome; districtId?: number; purpose?: 'treasure';
  pattern?: 'pillared-hall' | 'split-chamber' | 'local-loop';
};
export type EncounterRequest = {kind: 'goblin-post' | 'skeleton-crypt' | 'ogre-den' | 'biome-group'; regionId: number; anchor: Position; desiredCount: number};
export type DungeonDraft = {
  tiles: Array<Array<Tile | undefined>>;
  regions: DungeonRegion[];
  upstairs: Position;
  downstairs: Position;
  reserved: Set<SerializedPosition>;
  encounters: EncounterRequest[];
};
type Direction = 'up' | 'down' | 'left' | 'right';
type Door = {position: Position; direction: Direction; fromRegionId: number};

const FALLBACK_ROOM_SIZE = 10;
const FALLBACK_ROOM_GAP = 2;
const FALLBACK_MARGIN = 2;

function cells(topLeft: Position, bottomRight: Position): Position[] {
  const result: Position[] = [];
  for (let x = topLeft.x; x <= bottomRight.x; x++) for (let y = topLeft.y; y <= bottomRight.y; y++) result.push(new Position(x, y));
  return result;
}

function empty(tiles: Array<Array<Tile | undefined>>, a: Position, b: Position): boolean {
  if (a.x < 2 || a.y < 2 || b.x >= tiles.length - 2 || b.y >= tiles[0].length - 2) return false;
  for (let x = a.x; x <= b.x; x++) for (let y = a.y; y <= b.y; y++) if (tiles[x][y]) return false;
  return true;
}

function roomBounds(door: Door, width: number, height: number, offset: number): [Position, Position] {
  if (door.direction === 'up') return [new Position(door.position.x - offset, door.position.y - height), new Position(door.position.x - offset + width - 1, door.position.y - 1)];
  if (door.direction === 'down') return [new Position(door.position.x - offset, door.position.y + 1), new Position(door.position.x - offset + width - 1, door.position.y + height)];
  if (door.direction === 'left') return [new Position(door.position.x - width, door.position.y - offset), new Position(door.position.x - 1, door.position.y - offset + height - 1)];
  return [new Position(door.position.x + 1, door.position.y - offset), new Position(door.position.x + width, door.position.y - offset + height - 1)];
}

function addDoors(region: DungeonRegion, incoming: Direction | undefined, random: Random): Door[] {
  const choices: Direction[] = ['up', 'down', 'left', 'right'].filter(direction => !(
    (incoming === 'up' && direction === 'down') || (incoming === 'down' && direction === 'up') ||
    (incoming === 'left' && direction === 'right') || (incoming === 'right' && direction === 'left')
  )) as Direction[];
  const count = random() < .3 ? 1 : random() < .7 ? 2 : 3;
  const result: Door[] = [];
  for (let i = 0; i < count && choices.length; i++) {
    const direction = choices.splice(Math.floor(random() * choices.length), 1)[0];
    const horizontal = direction === 'up' || direction === 'down';
    const span = horizontal ? region.bottomRight.x - region.topLeft.x + 1 : region.bottomRight.y - region.topLeft.y + 1;
    const n = Math.floor(random() * span);
    const position = horizontal
      ? new Position(region.topLeft.x + n, direction === 'up' ? region.topLeft.y - 1 : region.bottomRight.y + 1)
      : new Position(direction === 'left' ? region.topLeft.x - 1 : region.bottomRight.x + 1, region.topLeft.y + n);
    result.push({position, direction, fromRegionId: region.id});
  }
  return result;
}

function graphDistances(regions: DungeonRegion[], start: number): Map<number, number> {
  const distances = new Map<number, number>([[start, 0]]), queue = [start];
  while (queue.length) { const id = queue.shift()!; for (const next of regions[id].neighbours) if (!distances.has(next)) { distances.set(next, distances.get(id)! + 1); queue.push(next); } }
  return distances;
}

export function reserveConnectivity(draft: DungeonDraft): void {
  draft.reserved.add(draft.upstairs.serialize()); draft.reserved.add(draft.downstairs.serialize());
  for (const region of draft.regions) {
    if (region.kind === 'corridor') for (const p of region.floor) draft.reserved.add(p.serialize());
    for (const entrance of region.entrances) {
      draft.reserved.add(entrance.serialize());
      const allowed = new Set(region.floor.map(position => position.serialize()));
      allowed.add(entrance.serialize());
      const queue = [entrance];
      const previous = new Map<SerializedPosition, Position>();
      const visited = new Set<SerializedPosition>([entrance.serialize()]);
      while (queue.length && !visited.has(region.anchor.serialize())) {
        const position = queue.shift()!;
        for (const neighbour of [position.up(), position.down(), position.left(), position.right()]) {
          if (!allowed.has(neighbour.serialize()) || visited.has(neighbour.serialize())) continue;
          visited.add(neighbour.serialize());
          previous.set(neighbour.serialize(), position);
          queue.push(neighbour);
        }
      }
      let position = region.anchor;
      while (!position.equals(entrance)) {
        draft.reserved.add(position.serialize());
        const prior = previous.get(position.serialize());
        if (!prior) break;
        position = prior;
      }
    }
  }
}

export function generateDungeonLayout(width: number, height: number, upstairs: Position, random: Random): DungeonDraft {
  const tiles = Array.from({length: width}, () => Array<Tile | undefined>(height));
  const initialTopLeft = new Position(Math.max(0, Math.min(width - 15, upstairs.x - 7)), Math.max(0, Math.min(height - 10, upstairs.y - 5)));
  const initialBottomRight = initialTopLeft.shift(14, 9);
  const initialFloor = cells(initialTopLeft, initialBottomRight);
  for (const p of initialFloor) tiles[p.x][p.y] = new FloorTile();
  const initial: DungeonRegion = {id: 0, kind: 'room', topLeft: initialTopLeft, bottomRight: initialBottomRight, floor: initialFloor, entrances: [], neighbours: [], anchor: upstairs};
  const regions = [initial];
  const doors: Door[] = [
    {position: new Position(initial.topLeft.x - 1, initial.anchor.y), direction: 'left', fromRegionId: initial.id},
    {position: new Position(initial.anchor.x, initial.topLeft.y - 1), direction: 'up', fromRegionId: initial.id},
    {position: new Position(initial.anchor.x, initial.bottomRight.y + 1), direction: 'down', fromRegionId: initial.id},
  ];
  const regionSafetyLimit = 1000;
  while (doors.length) {
    if (regions.length >= regionSafetyLimit) {
      throw new Error(`Dungeon layout exceeded the ${regionSafetyLimit}-region safety limit`);
    }
    const door = doors.shift()!; let made = false;
    for (let attempt = 0; attempt < 30 && !made; attempt++) {
      const corridor = random() < .2;
      const widthValue = corridor && (door.direction === 'up' || door.direction === 'down') ? 1 : Math.floor(random() * 15) + 5;
      const heightValue = corridor && (door.direction === 'left' || door.direction === 'right') ? 1 : Math.floor(random() * 10) + 5;
      const span = door.direction === 'up' || door.direction === 'down' ? widthValue : heightValue;
      const [topLeft, bottomRight] = roomBounds(door, widthValue, heightValue, Math.floor(random() * span));
      if (!empty(tiles, topLeft, bottomRight)) continue;
      const floor = cells(topLeft, bottomRight); const id = regions.length;
      for (const p of floor) tiles[p.x][p.y] = new FloorTile(); tiles[door.position.x][door.position.y] = new FloorTile();
      const center = new Position((topLeft.x + bottomRight.x) >> 1, (topLeft.y + bottomRight.y) >> 1);
      const anchor = floor.reduce((best, position) =>
        position.manhattanDistanceTo(center) < best.manhattanDistanceTo(center) ? position : best,
      floor[0]);
      const regionFloor = [...floor, door.position];
      const region: DungeonRegion = {
        id,
        kind: widthValue === 1 || heightValue === 1 ? 'corridor' : 'room',
        topLeft,
        bottomRight,
        floor: regionFloor,
        entrances: [door.position],
        neighbours: [door.fromRegionId],
        anchor,
      };
      regions[door.fromRegionId].neighbours.push(id); regions[door.fromRegionId].entrances.push(door.position); regions.push(region);
      doors.push(...addDoors(region, door.direction, random)); made = true;
    }
  }
  tiles[upstairs.x][upstairs.y] = new StairsUpTile();
  const distances = graphDistances(regions, 0); const rooms = regions.filter(r => r.kind === 'room' && r.id !== 0);
  rooms.sort((a, b) => (distances.get(b.id)! - distances.get(a.id)!) || (b.floor.length - a.floor.length));
  const destination = rooms[0] ?? regions[regions.length - 1]; const downstairs = destination.anchor;
  tiles[downstairs.x][downstairs.y] = new StairsDownTile();
  const draft: DungeonDraft = {tiles, regions, upstairs, downstairs, reserved: new Set(), encounters: []}; reserveConnectivity(draft); return draft;
}

function pathBetweenRooms(a: DungeonRegion, b: DungeonRegion): Position[] {
  if (a.bottomRight.x < b.topLeft.x) {
    return Array.from(
      {length: b.topLeft.x - a.bottomRight.x - 1},
      (_, index) => new Position(a.bottomRight.x + index + 1, a.anchor.y),
    );
  }
  if (b.bottomRight.x < a.topLeft.x) return pathBetweenRooms(b, a).reverse();
  if (a.bottomRight.y < b.topLeft.y) {
    return Array.from(
      {length: b.topLeft.y - a.bottomRight.y - 1},
      (_, index) => new Position(a.anchor.x, a.bottomRight.y + index + 1),
    );
  }
  return pathBetweenRooms(b, a).reverse();
}

function pathToRoom(position: Position, room: DungeonRegion): Position[] {
  const targetX = Math.max(room.topLeft.x, Math.min(room.bottomRight.x, position.x));
  const targetY = Math.max(room.topLeft.y, Math.min(room.bottomRight.y, position.y));
  const result = [position];
  let current = position;
  while (current.x !== targetX) {
    current = current.shift(current.x < targetX ? 1 : -1, 0);
    result.push(current);
  }
  while (current.y !== targetY) {
    current = current.shift(0, current.y < targetY ? 1 : -1);
    result.push(current);
  }
  return result;
}

/**
 * Builds a bounded fallback layout whose rooms and connecting tree are
 * deterministic. Random generation can terminate early; this layout is used
 * only when that result cannot meet the level's hard requirements.
 */
export function generateGuaranteedDungeonLayout(
  width: number,
  height: number,
  upstairs: Position,
  minimumNavigableTiles: number,
): DungeonDraft {
  const tiles = Array.from({length: width}, () => Array<Tile | undefined>(height));
  const step = FALLBACK_ROOM_SIZE + FALLBACK_ROOM_GAP;
  const columns = Math.floor((width - FALLBACK_MARGIN * 2 + FALLBACK_ROOM_GAP) / step);
  const rows = Math.floor((height - FALLBACK_MARGIN * 2 + FALLBACK_ROOM_GAP) / step);
  if (columns === 0 || rows === 0) throw new Error('Dungeon dimensions are too small for a fallback layout');

  const roomShapes: Array<{
    column: number;
    row: number;
    topLeft: Position;
    bottomRight: Position;
    width: number;
    height: number;
  }> = [];
  for (let column = 0; column < columns; column++) for (let row = 0; row < rows; row++) {
    const variant = (column * 7 + row * 11) % 4;
    const widthValue = variant === 1 ? 8 : FALLBACK_ROOM_SIZE;
    const heightValue = variant === 2 ? 8 : variant === 3 ? 9 : FALLBACK_ROOM_SIZE;
    const cellTopLeft = new Position(FALLBACK_MARGIN + column * step, FALLBACK_MARGIN + row * step);
    const topLeft = cellTopLeft.shift(
      Math.floor((FALLBACK_ROOM_SIZE - widthValue) / 2),
      Math.floor((FALLBACK_ROOM_SIZE - heightValue) / 2),
    );
    roomShapes.push({
      column,
      row,
      topLeft,
      bottomRight: topLeft.shift(widthValue - 1, heightValue - 1),
      width: widthValue,
      height: heightValue,
    });
  }
  const rootShape = roomShapes.reduce((nearest, shape) => {
    const nearestCenter = nearest.topLeft.shift(nearest.width >> 1, nearest.height >> 1);
    const shapeCenter = shape.topLeft.shift(shape.width >> 1, shape.height >> 1);
    return upstairs.manhattanDistanceTo(shapeCenter) < upstairs.manhattanDistanceTo(nearestCenter)
      ? shape
      : nearest;
  }, roomShapes[0]);
  roomShapes.sort((a, b) => {
    const aDistance = Math.abs(a.column - rootShape.column) + Math.abs(a.row - rootShape.row);
    const bDistance = Math.abs(b.column - rootShape.column) + Math.abs(b.row - rootShape.row);
    return aDistance - bDistance || a.column - b.column || a.row - b.row;
  });

  const regions: DungeonRegion[] = roomShapes.map((shape, id) => {
    const floor = cells(shape.topLeft, shape.bottomRight);
    for (const position of floor) tiles[position.x][position.y] = new FloorTile();
    return {
      id,
      kind: 'room',
      topLeft: shape.topLeft,
      bottomRight: shape.bottomRight,
      floor,
      entrances: [],
      neighbours: [],
      anchor: shape.topLeft.shift(shape.width >> 1, shape.height >> 1),
    };
  });
  const roomByCell = new Map(roomShapes.map((shape, index) => [`${shape.column},${shape.row}`, regions[index]]));
  for (let index = 1; index < roomShapes.length; index++) {
    const shape = roomShapes[index];
    const canMoveColumn = shape.column !== rootShape.column;
    const canMoveRow = shape.row !== rootShape.row;
    const moveColumn = canMoveColumn && (!canMoveRow || (shape.column * 31 + shape.row * 17) % 2 === 0);
    const parentColumn = moveColumn
      ? shape.column + (shape.column < rootShape.column ? 1 : -1)
      : shape.column;
    const parentRow = moveColumn
      ? shape.row
      : shape.row + (shape.row < rootShape.row ? 1 : -1);
    const room = regions[index];
    const parent = roomByCell.get(`${parentColumn},${parentRow}`)!;
    const floor = pathBetweenRooms(parent, room);
    for (const position of floor) tiles[position.x][position.y] = new FloorTile();
    const id = regions.length;
    const first = floor[0];
    const last = floor[floor.length - 1];
    const corridor: DungeonRegion = {
      id,
      kind: 'corridor',
      topLeft: new Position(Math.min(first.x, last.x), Math.min(first.y, last.y)),
      bottomRight: new Position(Math.max(first.x, last.x), Math.max(first.y, last.y)),
      floor,
      entrances: [first, last],
      neighbours: [parent.id, room.id],
      anchor: floor[Math.floor(floor.length / 2)],
    };
    parent.neighbours.push(id);
    room.neighbours.push(id);
    parent.entrances.push(first);
    room.entrances.push(last);
    regions.push(corridor);
  }

  const root = regions[0];
  const upstairsPath = pathToRoom(upstairs, root);
  for (const position of upstairsPath) {
    tiles[position.x][position.y] = new FloorTile();
    if (!root.floor.some(candidate => candidate.equals(position))) root.floor.push(position);
  }
  const distancesFromUpstairs = graphDistances(regions, 0);
  const farthestRoom = regions
    .filter(region => region.kind === 'room')
    .reduce((farthest, room) =>
      distancesFromUpstairs.get(room.id)! > distancesFromUpstairs.get(farthest.id)! ? room : farthest,
    );
  const downstairs = farthestRoom.anchor;
  tiles[upstairs.x][upstairs.y] = new StairsUpTile();
  tiles[downstairs.x][downstairs.y] = new StairsDownTile();
  const draft: DungeonDraft = {tiles, regions, upstairs, downstairs, reserved: new Set(), encounters: []};
  reserveConnectivity(draft);
  for (const position of upstairsPath) draft.reserved.add(position.serialize());
  for (const region of regions) {
    if (region.kind !== 'room') continue;
    for (const position of region.floor) {
      const perimeter = position.x === region.topLeft.x || position.x === region.bottomRight.x ||
        position.y === region.topLeft.y || position.y === region.bottomRight.y;
      if (perimeter) draft.reserved.add(position.serialize());
    }
  }
  const navigableCount = tiles.reduce(
    (total, column) => total + column.filter(tile => tile?.isNavigable()).length,
    0,
  );
  if (navigableCount < minimumNavigableTiles) {
    throw new Error(
      `Dungeon dimensions can provide only ${navigableCount} guaranteed navigable tiles; ${minimumNavigableTiles} required`,
    );
  }
  return draft;
}

import {Position} from '../../io/position';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {EmberworksFloorTile} from '../tiles/emberworks-floor.tile';
import {FlagstoneFloorTile} from '../tiles/flagstone-floor.tile';
import {MasonryWallTile} from '../tiles/masonry-wall.tile';
import {MoldFloorTile} from '../tiles/mold-floor.tile';
import {MossWallTile} from '../tiles/moss-wall.tile';
import {PipeWallTile} from '../tiles/pipe-wall.tile';
import {RoughWallTile} from '../tiles/rough-wall.tile';
import {Tile} from '../tiles/abstract.tile';
import {DungeonBiome, DungeonDraft, DungeonRegion, Random} from './dungeon-layout';
import {reachableTiles} from './dungeon-validation';

export type DungeonPattern = 'pillared-hall' | 'split-chamber' | 'local-loop';

function wallFor(biome: DungeonBiome): Tile {
  if (biome === DungeonBiome.Fungal) return new MossWallTile();
  if (biome === DungeonBiome.Cavern) return new RoughWallTile();
  if (biome === DungeonBiome.Emberworks) return new PipeWallTile();
  return new MasonryWallTile();
}

function floorFor(biome: DungeonBiome): Tile {
  if (biome === DungeonBiome.Fungal) return new MoldFloorTile();
  if (biome === DungeonBiome.Cavern) return new CaveFloorTile();
  if (biome === DungeonBiome.Emberworks) return new EmberworksFloorTile();
  return new FlagstoneFloorTile();
}

function roomCandidates(draft: DungeonDraft): DungeonRegion[] {
  return draft.regions.filter(region =>
    region.kind === 'room' &&
    region.id !== 0 &&
    !region.pattern &&
    !region.purpose &&
    !region.floor.some(position => position.equals(draft.upstairs) || position.equals(draft.downstairs)),
  );
}

function shuffle<T>(values: T[], random: Random): T[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function applyBlockingPattern(
  draft: DungeonDraft,
  room: DungeonRegion,
  points: Position[],
  pattern: 'pillared-hall' | 'split-chamber',
  random: Random,
): boolean {
  const legal = points.filter(position =>
    draft.tiles[position.x]?.[position.y]?.isNavigable() &&
    !draft.reserved.has(position.serialize()),
  );
  if (legal.length < 4) return false;
  const previous = legal.map(position => ({position, tile: draft.tiles[position.x][position.y]!}));
  const pipeWall = room.biome === DungeonBiome.Emberworks
    ? PipeWallTile.withRandomDescription(random)
    : undefined;
  for (const position of legal) {
    draft.tiles[position.x][position.y] = pipeWall
      ? new PipeWallTile(pipeWall.descriptionId)
      : wallFor(room.biome!);
  }
  const reached = reachableTiles(draft);
  if (!reached.has(room.anchor.serialize()) || !room.entrances.every(entrance => reached.has(entrance.serialize()))) {
    for (const replacement of previous) draft.tiles[replacement.position.x][replacement.position.y] = replacement.tile;
    return false;
  }
  room.pattern = pattern;
  return true;
}

function addPillaredHall(draft: DungeonDraft, random: Random): boolean {
  const rooms = shuffle(roomCandidates(draft).filter(room =>
    room.bottomRight.x - room.topLeft.x >= 8 && room.bottomRight.y - room.topLeft.y >= 6,
  ), random);
  for (const room of rooms) {
    const horizontal = room.bottomRight.x - room.topLeft.x >= room.bottomRight.y - room.topLeft.y;
    const points: Position[] = [];
    if (horizontal) {
      for (let x = room.topLeft.x + 2; x <= room.bottomRight.x - 2; x += 3) {
        points.push(new Position(x, room.anchor.y - 2), new Position(x, room.anchor.y + 2));
      }
    } else {
      for (let y = room.topLeft.y + 2; y <= room.bottomRight.y - 2; y += 3) {
        points.push(new Position(room.anchor.x - 2, y), new Position(room.anchor.x + 2, y));
      }
    }
    if (applyBlockingPattern(draft, room, points.slice(0, 8), 'pillared-hall', random)) return true;
  }
  return false;
}

function addSplitChamber(draft: DungeonDraft, random: Random): boolean {
  const rooms = shuffle(roomCandidates(draft).filter(room =>
    room.bottomRight.x - room.topLeft.x >= 9 && room.bottomRight.y - room.topLeft.y >= 7,
  ), random);
  for (const room of rooms) {
    const horizontal = room.bottomRight.x - room.topLeft.x >= room.bottomRight.y - room.topLeft.y;
    const points: Position[] = [];
    if (horizontal) {
      const gapA = room.topLeft.y + Math.floor((room.bottomRight.y - room.topLeft.y) / 3);
      const gapB = room.topLeft.y + Math.floor((room.bottomRight.y - room.topLeft.y) * 2 / 3);
      for (let y = room.topLeft.y + 1; y < room.bottomRight.y; y++) {
        if (y !== gapA && y !== gapB) points.push(new Position(room.anchor.x, y));
      }
    } else {
      const gapA = room.topLeft.x + Math.floor((room.bottomRight.x - room.topLeft.x) / 3);
      const gapB = room.topLeft.x + Math.floor((room.bottomRight.x - room.topLeft.x) * 2 / 3);
      for (let x = room.topLeft.x + 1; x < room.bottomRight.x; x++) {
        if (x !== gapA && x !== gapB) points.push(new Position(x, room.anchor.y));
      }
    }
    if (applyBlockingPattern(draft, room, points, 'split-chamber', random)) return true;
  }
  return false;
}

type LoopCandidate = {a: DungeonRegion; b: DungeonRegion; path: Position[]};

function horizontalLoop(a: DungeonRegion, b: DungeonRegion): Position[] {
  if (a.bottomRight.x >= b.topLeft.x) return [];
  const startY = Math.max(a.topLeft.y, b.topLeft.y);
  const endY = Math.min(a.bottomRight.y, b.bottomRight.y);
  const gap = b.topLeft.x - a.bottomRight.x - 1;
  if (startY > endY || gap < 1 || gap > 10) return [];
  const y = Math.floor((startY + endY) / 2);
  return Array.from({length: gap}, (_, i) => new Position(a.bottomRight.x + 1 + i, y));
}

function verticalLoop(a: DungeonRegion, b: DungeonRegion): Position[] {
  if (a.bottomRight.y >= b.topLeft.y) return [];
  const startX = Math.max(a.topLeft.x, b.topLeft.x);
  const endX = Math.min(a.bottomRight.x, b.bottomRight.x);
  const gap = b.topLeft.y - a.bottomRight.y - 1;
  if (startX > endX || gap < 1 || gap > 10) return [];
  const x = Math.floor((startX + endX) / 2);
  return Array.from({length: gap}, (_, i) => new Position(x, a.bottomRight.y + 1 + i));
}

function addLocalLoop(draft: DungeonDraft, random: Random): boolean {
  const rooms = roomCandidates(draft);
  const candidates: LoopCandidate[] = [];
  for (let i = 0; i < rooms.length; i++) for (let j = i + 1; j < rooms.length; j++) {
    if (rooms[i].neighbours.includes(rooms[j].id)) continue;
    const orientations: Array<[DungeonRegion, DungeonRegion, Position[]]> = [
      [rooms[i], rooms[j], horizontalLoop(rooms[i], rooms[j])],
      [rooms[j], rooms[i], horizontalLoop(rooms[j], rooms[i])],
      [rooms[i], rooms[j], verticalLoop(rooms[i], rooms[j])],
      [rooms[j], rooms[i], verticalLoop(rooms[j], rooms[i])],
    ];
    const match = orientations.find(([, , path]) => path.length > 0);
    if (match) candidates.push({a: match[0], b: match[1], path: match[2]});
  }
  for (const candidate of shuffle(candidates, random)) {
    if (candidate.path.some(position =>
      draft.tiles[position.x]?.[position.y]?.isNavigable() || draft.reserved.has(position.serialize()),
    )) continue;
    const first = candidate.path[0];
    const last = candidate.path[candidate.path.length - 1];
    const before = first.x === last.x ? first.up() : first.left();
    const after = first.x === last.x ? last.down() : last.right();
    if (!draft.tiles[before.x]?.[before.y]?.isNavigable() || !draft.tiles[after.x]?.[after.y]?.isNavigable()) continue;
    for (let i = 0; i < candidate.path.length; i++) {
      const biome = i < candidate.path.length / 2 ? candidate.a.biome! : candidate.b.biome!;
      draft.tiles[candidate.path[i].x][candidate.path[i].y] = floorFor(biome);
      draft.reserved.add(candidate.path[i].serialize());
    }
    const id = draft.regions.length;
    const region: DungeonRegion = {
      id,
      kind: 'corridor',
      topLeft: new Position(Math.min(first.x, last.x), Math.min(first.y, last.y)),
      bottomRight: new Position(Math.max(first.x, last.x), Math.max(first.y, last.y)),
      floor: candidate.path,
      entrances: [first, last],
      neighbours: [candidate.a.id, candidate.b.id],
      anchor: candidate.path[Math.floor(candidate.path.length / 2)],
      biome: candidate.a.biome,
      districtId: candidate.a.districtId,
      pattern: 'local-loop',
    };
    candidate.a.neighbours.push(id);
    candidate.b.neighbours.push(id);
    draft.regions.push(region);
    return true;
  }
  return false;
}

export function addRareDungeonPattern(draft: DungeonDraft, random: Random): DungeonPattern | null {
  if (random() >= .4) return null;
  const patterns: Array<readonly [DungeonPattern, () => boolean]> = [
    ['pillared-hall', () => addPillaredHall(draft, random)],
    ['split-chamber', () => addSplitChamber(draft, random)],
    ['local-loop', () => addLocalLoop(draft, random)],
  ];
  const start = Math.floor(random() * patterns.length);
  for (let offset = 0; offset < patterns.length; offset++) {
    const [pattern, apply] = patterns[(start + offset) % patterns.length];
    if (apply()) return pattern;
  }
  return null;
}

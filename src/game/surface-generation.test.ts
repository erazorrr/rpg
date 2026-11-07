import {Position} from '../io/position';
import {
  generateSurfaceDraft,
  selectSurfaceNpcPositions,
  SURFACE_HEIGHT,
  SURFACE_WIDTH,
} from './surface-generation';
import {BareEarthTile} from './tiles/bare-earth.tile';
import {GrassTile} from './tiles/grass.tile';
import {StairsDownTile} from './tiles/stairs-down.tile';
import {TreeTile} from './tiles/tree.tile';
import {WoodenWallTile} from './tiles/wooden-wall.tile';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function hasNavigablePath(start: Position, destination: Position, draft: ReturnType<typeof generateSurfaceDraft>): boolean {
  const visited = new Set([start.serialize()]);
  const frontier = [start];
  while (frontier.length > 0) {
    const current = frontier.shift()!;
    if (current.equals(destination)) return true;
    for (const next of [current.up(), current.right(), current.down(), current.left()]) {
      if (next.x < 0 || next.y < 0 || next.x >= SURFACE_WIDTH || next.y >= SURFACE_HEIGHT) continue;
      if (visited.has(next.serialize()) || !draft.tiles[next.x][next.y].isNavigable()) continue;
      visited.add(next.serialize());
      frontier.push(next);
    }
  }
  return false;
}

function reachablePositions(start: Position, draft: ReturnType<typeof generateSurfaceDraft>): Set<string> {
  const visited = new Set([start.serialize()]);
  const frontier = [start];
  while (frontier.length > 0) {
    const current = frontier.shift()!;
    for (const next of [current.up(), current.right(), current.down(), current.left()]) {
      if (next.x < 0 || next.y < 0 || next.x >= SURFACE_WIDTH || next.y >= SURFACE_HEIGHT) continue;
      if (visited.has(next.serialize()) || !draft.tiles[next.x][next.y].isNavigable()) continue;
      visited.add(next.serialize());
      frontier.push(next);
    }
  }
  return visited;
}

describe('surface generation', () => {
  it('carves a dirt trail through the woods to downstairs inside a wooden shack', () => {
    const draft = generateSurfaceDraft(seeded(17));
    const tiles = draft.tiles.flat();

    expect(draft.tiles).toHaveLength(SURFACE_WIDTH);
    expect(draft.tiles[0]).toHaveLength(SURFACE_HEIGHT);
    expect(tiles.filter(tile => tile instanceof TreeTile).length).toBeGreaterThan(2500);
    expect(tiles.filter(tile => tile instanceof TreeTile).length).toBeLessThan(7500);
    expect(tiles.filter(tile => tile instanceof GrassTile).length).toBeGreaterThan(3000);
    expect(tiles.filter(tile => tile instanceof BareEarthTile).length).toBeGreaterThan(500);
    expect(tiles.filter(tile => tile instanceof WoodenWallTile).length).toBeGreaterThan(30);
    expect(tiles.every(tile => tile.isExplored())).toBe(true);
    expect(draft.tiles[draft.entrancePosition.x][draft.entrancePosition.y]).toBeInstanceOf(StairsDownTile);
    expect(hasNavigablePath(draft.initialPosition, draft.entrancePosition, draft)).toBe(true);
    const reachable = reachablePositions(draft.initialPosition, draft);
    const reachableOffPath = Array.from(reachable).filter(serialized => !draft.road.has(serialized));
    expect(reachableOffPath.length).toBeGreaterThan(2000);
    expect(Array.from(draft.road).every(serialized => {
      const position = Position.deserialize(serialized);
      return draft.tiles[position.x][position.y].isNavigable();
    })).toBe(true);

    const stairs = draft.entrancePosition;
    expect(draft.tiles[stairs.x][stairs.y - 4]).toBeInstanceOf(WoodenWallTile);
    expect(draft.tiles[stairs.x][stairs.y + 4]).toBeInstanceOf(WoodenWallTile);
    expect(draft.tiles[stairs.x + 3][stairs.y]).toBeInstanceOf(WoodenWallTile);
  });

  it('spaces all surface encounters along legal dirt trail positions', () => {
    const draft = generateSurfaceDraft(seeded(29));
    const positions = selectSurfaceNpcPositions(
      draft.freeTiles,
      draft.initialPosition,
      draft.entrancePosition,
      draft.road,
      seeded(31),
    );

    expect(positions).toHaveLength(11);
    expect(new Set(positions.map(position => position.serialize())).size).toBe(11);
    for (const position of positions) {
      expect(position.manhattanDistanceTo(draft.entrancePosition)).toBeGreaterThanOrEqual(15);
      expect(draft.road.has(position.serialize())).toBe(true);
      expect(draft.tiles[position.x][position.y]).toBeInstanceOf(BareEarthTile);
    }
  });

  it('keeps the trail, shack, and encounters valid across generated surfaces', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const draft = generateSurfaceDraft(seeded(seed));
      const positions = selectSurfaceNpcPositions(
        draft.freeTiles,
        draft.initialPosition,
        draft.entrancePosition,
        draft.road,
        seeded(seed + 1000),
      );

      expect(hasNavigablePath(draft.initialPosition, draft.entrancePosition, draft)).toBe(true);
      expect(positions).toHaveLength(11);
      expect(Array.from(draft.road).every(serialized => {
        const position = Position.deserialize(serialized);
        return draft.tiles[position.x][position.y].isNavigable();
      })).toBe(true);
    }
  });
});

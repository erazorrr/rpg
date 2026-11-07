import {Position, SerializedPosition} from '../../io/position';
import {DungeonDraft} from './dungeon-layout';

export const MIN_DUNGEON_NAVIGABLE_TILES = 22000;

export function cardinalNeighbours(position: Position): Position[] {
  return [position.up(), position.down(), position.left(), position.right()];
}

export function reachableTiles(draft: DungeonDraft): Set<SerializedPosition> {
  const reached = new Set<SerializedPosition>([draft.upstairs.serialize()]);
  const queue = [draft.upstairs];
  while (queue.length) {
    const position = queue.shift()!;
    for (const neighbour of cardinalNeighbours(position)) {
      if (reached.has(neighbour.serialize()) || !draft.tiles[neighbour.x]?.[neighbour.y]?.isNavigable()) continue;
      reached.add(neighbour.serialize());
      queue.push(neighbour);
    }
  }
  return reached;
}

export function validateDungeonTerrain(draft: DungeonDraft): void {
  const reached = reachableTiles(draft);
  if (!reached.has(draft.downstairs.serialize())) throw new Error('Dungeon stairs are disconnected');
  for (const region of draft.regions) {
    if (!reached.has(region.anchor.serialize())) throw new Error(`Dungeon region ${region.id} is disconnected`);
  }
}

export function countNavigableTiles(draft: DungeonDraft): number {
  let count = 0;
  for (const column of draft.tiles) {
    for (const tile of column) if (tile?.isNavigable()) count++;
  }
  return count;
}

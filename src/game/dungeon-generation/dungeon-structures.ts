import {Position} from '../../io/position';
import {BarricadeTile} from '../tiles/barricade.tile';
import {DeadBrazierTile} from '../tiles/dead-brazier.tile';
import {GlowingMushroomTile} from '../tiles/glowing-mushroom.tile';
import {RubbleTile} from '../tiles/rubble.tile';
import {StatueTile} from '../tiles/statue.tile';
import {StatueInscriptionId, statueInscriptionIds} from '../tiles/statue-inscriptions';
import {statueVariantIds} from '../tiles/statue-variants';
import {StonePillarTile} from '../tiles/stone-pillar.tile';
import {TorchTile} from '../tiles/torch.tile';
import {MistSeepTile} from '../tiles/mist-seep.tile';
import {SteamFissureTile} from '../tiles/steam-fissure.tile';
import {SmokingBrazierTile} from '../tiles/smoking-brazier.tile';
import {DungeonBiome, DungeonDraft, DungeonRegion, EncounterRequest, Random} from './dungeon-layout';
import {reachableTiles} from './dungeon-validation';
import {LootChestTile} from '../tiles/loot-chest.tile';

type Replacement = {position: Position; tile: import('../tiles/abstract.tile').Tile};
type Proposal = {
  replacements: Replacement[];
  encounter?: EncounterRequest;
  statueInscriptionId?: StatueInscriptionId;
};

function createStatue(random: Random, availableInscriptions: StatueInscriptionId[]): StatueTile {
  const inscriptionIndex = Math.floor(random() * availableInscriptions.length);
  const inscriptionId = availableInscriptions.splice(inscriptionIndex, 1)[0];
  const variantId = statueVariantIds[Math.floor(random() * statueVariantIds.length)];
  return new StatueTile(inscriptionId, variantId);
}

function available(draft: DungeonDraft, position: Position): boolean {
  return draft.tiles[position.x]?.[position.y]?.isNavigable() === true && !draft.reserved.has(position.serialize());
}

export function addTreasureRooms(
  draft: DungeonDraft,
  random: Random,
  createChest: () => LootChestTile,
): number {
  const rooms = draft.regions.filter(region =>
    region.kind === 'room' &&
    region.id !== 0 &&
    !region.pattern &&
    region.floor.length >= 35 &&
    !region.floor.some(position => position.equals(draft.upstairs) || position.equals(draft.downstairs)),
  );
  for (let i = rooms.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
  }

  let placed = 0;
  for (const room of rooms) {
    const candidates = room.floor
      .filter(position => available(draft, position))
      .filter(position => [position.up(), position.down(), position.left(), position.right()]
        .some(neighbour => draft.tiles[neighbour.x]?.[neighbour.y]?.isNavigable()))
      .sort((a, b) => {
        const aDistance = Math.min(...room.entrances.map(entrance => a.manhattanDistanceTo(entrance)));
        const bDistance = Math.min(...room.entrances.map(entrance => b.manhattanDistanceTo(entrance)));
        return bDistance - aDistance;
      });
    const position = candidates[0];
    if (!position) continue;
    draft.tiles[position.x][position.y] = createChest();
    draft.reserved.add(position.serialize());
    room.purpose = 'treasure';
    placed++;
    if (placed === 2) break;
  }
  return placed;
}
function shrine(
  draft: DungeonDraft,
  room: DungeonRegion,
  random: Random,
  depth: number,
  availableInscriptions: StatueInscriptionId[],
): Proposal | null {
  if (availableInscriptions.length === 0) return null;
  if (room.floor.length < 63) return null;
  const statue = room.anchor.shift(0, -2);
  const pillars = [statue.shift(-2, 0), statue.shift(2, 0)];
  if (![statue, ...pillars].every(position => available(draft, position))) return null;
  const brazier = room.anchor.shift(0, 2);
  const statueTile = createStatue(random, availableInscriptions);
  const pillar = StonePillarTile.withRandomDescription(random);
  return {
    replacements: [
      {position: statue, tile: statueTile},
      ...pillars.map(position => ({position, tile: new StonePillarTile(pillar.descriptionId)})),
      ...(random() < .5 && available(draft, brazier) ? [{
        position: brazier,
        tile: random() < .25
          ? SmokingBrazierTile.withRandomDescription(random)
          : DeadBrazierTile.withRandomDescription(random),
      }] : []),
    ],
    statueInscriptionId: statueTile.inscriptionId,
    encounter: depth >= 3 && random() < .45
      ? {kind: 'skeleton-crypt', regionId: room.id, anchor: room.anchor, desiredCount: 3}
      : undefined,
  };
}
function guardPost(draft: DungeonDraft, room: DungeonRegion, random: Random): Proposal | null {
  if (room.floor.length < 35) return null;
  const y = room.anchor.y - 2;
  const xs = [room.anchor.x - 2, room.anchor.x - 1, room.anchor.x + 1, room.anchor.x + 2];
  const points = xs.map(x => new Position(x, y));
  if (points.some(p => !available(draft, p))) return null;
  const torch = room.anchor.shift(0, -3);
  const barricade = BarricadeTile.withRandomDescription(random);
  return {
    replacements: [
      ...points.map(position => ({position, tile: new BarricadeTile(barricade.descriptionId)})),
      ...(available(draft, torch) ? [{
        position: torch,
        tile: random() < .45 ? SmokingBrazierTile.withRandomDescription(random) : new TorchTile(),
      }] : []),
    ],
    encounter: random() < .65
      ? {kind: 'goblin-post', regionId: room.id, anchor: room.anchor, desiredCount: 4}
      : undefined,
  };
}
function crypt(
  draft: DungeonDraft,
  room: DungeonRegion,
  random: Random,
  depth: number,
  availableInscriptions: StatueInscriptionId[],
): Proposal | null {
  if (availableInscriptions.length === 0) return null;
  if (room.floor.length < 63) return null;
  const points = [
    room.anchor.shift(-2, -2), room.anchor.shift(2, -2),
    room.anchor.shift(-2, 2), room.anchor.shift(2, 2),
  ];
  if (points.some(p => !available(draft, p))) return null;
  const memorial = room.anchor.shift(0, -2);
  if (!available(draft, memorial)) return null;
  const statueTile = createStatue(random, availableInscriptions);
  const pillar = StonePillarTile.withRandomDescription(random);
  return {
    replacements: [
      ...points.map(position => ({position, tile: new StonePillarTile(pillar.descriptionId)})),
      {position: memorial, tile: statueTile},
    ],
    statueInscriptionId: statueTile.inscriptionId,
    encounter: depth >= 3 && random() < .75
      ? {kind: 'skeleton-crypt', regionId: room.id, anchor: room.anchor, desiredCount: 5}
      : undefined,
  };
}
function den(draft: DungeonDraft, room: DungeonRegion, random: Random, depth: number): Proposal | null {
  if (room.floor.length < 80) return null;
  const points = [
    new Position(room.topLeft.x + 1, room.topLeft.y + 1),
    new Position(room.bottomRight.x - 1, room.topLeft.y + 1),
    new Position(room.topLeft.x + 1, room.bottomRight.y - 1),
    new Position(room.bottomRight.x - 1, room.bottomRight.y - 1),
  ].filter(p => available(draft, p));
  if (points.length < 2) return null;
  const rubble = RubbleTile.withRandomDescription(random);
  const replacements = points.map(position => ({
    position,
    tile: new RubbleTile(rubble.descriptionId) as import('../tiles/abstract.tile').Tile,
  }));
  if (random() < .4 && available(draft, room.anchor.shift(0, 2))) {
    replacements.push({position: room.anchor.shift(0, 2), tile: SteamFissureTile.withRandomDescription(random)});
  }
  return {
    replacements,
    encounter: depth >= 2 && random() < .7
      ? {kind: 'ogre-den', regionId: room.id, anchor: room.anchor, desiredCount: depth === 3 ? 3 : 2}
      : undefined,
  };
}
function grove(draft: DungeonDraft, room: DungeonRegion, random: Random): Proposal | null {
  if (room.floor.length < 48) return null;
  const points = [
    room.anchor.shift(-2, 0), room.anchor.shift(2, 0),
    room.anchor.shift(0, -2), room.anchor.shift(0, 2),
  ].filter(position => available(draft, position));
  if (points.length < 3) return null;
  const replacements = points.map(position => ({
    position,
    tile: GlowingMushroomTile.withRandomDescription(random) as import('../tiles/abstract.tile').Tile,
  }));
  if (random() < .3 && available(draft, room.anchor)) {
    replacements.push({position: room.anchor, tile: MistSeepTile.withRandomDescription(random)});
  }
  return {replacements};
}
function pumpStation(draft: DungeonDraft, room: DungeonRegion, random: Random): Proposal | null {
  if (room.floor.length < 48) return null;
  const points = [
    room.anchor.shift(-2, 0), room.anchor.shift(2, 0),
    room.anchor.shift(0, -2), room.anchor.shift(0, 2),
  ].filter(position => available(draft, position));
  if (points.length < 2) return null;
  const count = random() < .6 ? 2 : 3;
  return {
    replacements: points.slice(0, count).map(position => ({
      position,
      tile: SteamFissureTile.withRandomDescription(random),
    })),
  };
}
export function decorateDungeon(
  draft: DungeonDraft,
  depth: number,
  random: Random,
  usedStatueInscriptions: ReadonlySet<StatueInscriptionId> = new Set(),
): number {
  const availableInscriptions = statueInscriptionIds.filter(id => !usedStatueInscriptions.has(id));
  const rooms = draft.regions.filter(region =>
    region.kind === 'room' &&
    !region.purpose &&
    !region.pattern &&
    !region.floor.some(position => position.equals(draft.upstairs) || position.equals(draft.downstairs)),
  );
  for (let i = rooms.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [rooms[i], rooms[j]] = [rooms[j], rooms[i]]; }
  const target = Math.max(6, Math.min(24, Math.floor(rooms.length / 9))); let successes = 0;
  for (const room of rooms) { if (successes >= target) break; let proposal: Proposal | null = null;
    if (room.biome === DungeonBiome.Fungal) proposal = grove(draft, room, random);
    else if (room.biome === DungeonBiome.Emberworks) {
      proposal = random() < .65
        ? pumpStation(draft, room, random)
        : guardPost(draft, room, random);
    }
    else if (room.biome === DungeonBiome.Undercroft) {
      proposal = random() < .45
        ? crypt(draft, room, random, depth, availableInscriptions)
        : random() < .65
          ? guardPost(draft, room, random)
          : shrine(draft, room, random, depth, availableInscriptions);
    } else {
      proposal = random() < .35
        ? den(draft, room, random, depth)
        : random() < .65
          ? guardPost(draft, room, random)
          : shrine(draft, room, random, depth, availableInscriptions);
    }
    if (!proposal) continue;
    if (proposal.replacements.some(r => draft.reserved.has(r.position.serialize()))) {
      if (proposal.statueInscriptionId) availableInscriptions.push(proposal.statueInscriptionId);
      continue;
    }
    const previous = proposal.replacements.map(replacement => ({
      position: replacement.position,
      tile: draft.tiles[replacement.position.x][replacement.position.y]!,
    }));
    for (const replacement of proposal.replacements) {
      draft.tiles[replacement.position.x][replacement.position.y] = replacement.tile;
    }
    const reached = reachableTiles(draft);
    if (!room.entrances.every(position => reached.has(position.serialize())) || !reached.has(room.anchor.serialize())) {
      for (const replacement of previous) draft.tiles[replacement.position.x][replacement.position.y] = replacement.tile;
      if (proposal.statueInscriptionId) availableInscriptions.push(proposal.statueInscriptionId);
      continue;
    }
    if (proposal.encounter) draft.encounters.push(proposal.encounter); successes++;
  }
  return successes;
}

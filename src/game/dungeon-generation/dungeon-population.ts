import {Context} from '../context';
import {Level} from '../level';
import {Npc} from '../npc';
import {DungeonBiome, DungeonDraft, EncounterRequest, Random} from './dungeon-layout';
import {weightedChoice} from './dungeon-biomes';
import {reachableTiles} from './dungeon-validation';
import {Goblin} from '../monsters/goblin';
import {GoblinHunter} from '../monsters/goblin-hunter';
import {GoblinMage} from '../monsters/goblin-mage';
import {Ogre} from '../monsters/ogre';
import {OgreMage} from '../monsters/ogre-mage';
import {Skeleton} from '../monsters/skeleton';
import {SkeletonArcher} from '../monsters/skeleton-archer';
import {SkeletonMage} from '../monsters/skeleton-mage';
import {TreasureGoblin} from '../monsters/treasure-goblin';
import {StrengthMonsterModifier} from '../monster-modifiers/strength';
import {DexterityMonsterModifier} from '../monster-modifiers/dexterity';
import {EnduranceMonsterModifier} from '../monster-modifiers/endurance';
import {SpectralHitMonsterModifier} from '../monster-modifiers/spectral-hit';
import {WisdomMonsterModifier} from '../monster-modifiers/wisdom';
import {Position, SerializedPosition} from '../../io/position';
import {AshenSkeleton} from '../monsters/ashen-skeleton';
import {SteamBeetle} from '../monsters/steam-beetle';
import {PhaseSpider} from '../monsters/phase-spider';
import {RiftWisp} from '../monsters/rift-wisp';
import {CaveLeech} from '../monsters/cave-leech';
import {BloodBat} from '../monsters/blood-bat';
import {Vampire} from '../monsters/vampire';
import {VampiricMonsterModifier} from '../monster-modifiers/vampiric';
import {CaveAsp} from '../monsters/cave-asp';
import {GoblinSkirmisher} from '../monsters/goblin-skirmisher';
import {KoboldTunnelGuard} from '../monsters/kobold-tunnel-guard';
import {KoboldHookBearer} from '../monsters/kobold-hook-bearer';
import {KoboldSalvekeeper} from '../monsters/kobold-salvekeeper';
import {GnomeArcher} from '../monsters/gnome-archer';
import {GnomeWarlock} from '../monsters/gnome-warlock';
import {BoundFamiliar} from '../monsters/bound-familiar';
import {WarmthFountain} from '../monsters/warmth-fountain';
import {RimeProjector} from '../monsters/rime-projector';
import {EmberTurret} from '../monsters/ember-turret';
import {EmberworkMechanism} from '../monsters/emberwork-mechanism';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {MoldFloorTile} from '../tiles/mold-floor.tile';
import {FlagstoneFloorTile} from '../tiles/flagstone-floor.tile';
import {EmberworksFloorTile} from '../tiles/emberworks-floor.tile';

type NpcConstructor = new (context: Context, level: Level, position: Position) => Npc;
export const ORDINARY_DUNGEON_NPC_TARGET = 450;
const STRUCTURE_NPC_BUDGET = Math.floor(ORDINARY_DUNGEON_NPC_TARGET * .15);
const BIOME_GROUP_NPC_BUDGET = Math.floor(ORDINARY_DUNGEON_NPC_TARGET * .30);
const tables: Record<number, Array<readonly [NpcConstructor, number]>> = {
  1: [
    [Goblin, 38], [GoblinSkirmisher, 10], [GoblinHunter, 7], [GoblinMage, 6],
    [KoboldTunnelGuard, 28], [KoboldHookBearer, 10], [KoboldSalvekeeper, 8],
    [GnomeArcher, 12], [GnomeWarlock, 2], [SteamBeetle, 12],
    [CaveLeech, 8], [BloodBat, 6], [CaveAsp, 8],
  ],
  2: [
    [Ogre, 12], [Goblin, 15], [GoblinHunter, 10], [OgreMage, 6], [GoblinMage, 10],
    [KoboldTunnelGuard, 20], [KoboldHookBearer, 12], [KoboldSalvekeeper, 10],
    [GnomeArcher, 16], [GnomeWarlock, 3],
    [AshenSkeleton, 4], [SteamBeetle, 8], [PhaseSpider, 6], [RiftWisp, 4],
    [CaveLeech, 10], [BloodBat, 8], [CaveAsp, 6],
  ],
  3: [
    [Ogre, 12], [Skeleton, 15], [AshenSkeleton, 7], [GoblinHunter, 8],
    [SkeletonArcher, 10], [OgreMage, 6], [SkeletonMage, 5], [GoblinMage, 8],
    [KoboldTunnelGuard, 12], [KoboldHookBearer, 10], [KoboldSalvekeeper, 8],
    [GnomeArcher, 18], [GnomeWarlock, 4],
    [PhaseSpider, 10], [RiftWisp, 8], [BloodBat, 5], [Vampire, 6],
    [SteamBeetle, 6],
  ],
};
const modifiers = [
  [],
  [EnduranceMonsterModifier],
  [
    StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier,
    VampiricMonsterModifier, WisdomMonsterModifier,
  ],
  [
    StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier,
    SpectralHitMonsterModifier, VampiricMonsterModifier, WisdomMonsterModifier,
  ],
] as const;
function family(c: NpcConstructor):
  'goblin' | 'kobold' | 'gnome' | 'ogre' | 'skeleton' | 'beetle' | 'spider' | 'wisp' | 'leech' | 'bat' | 'vampire' | 'asp' {
  if (c === SteamBeetle) return 'beetle';
  if (c === PhaseSpider) return 'spider';
  if (c === RiftWisp) return 'wisp';
  if (c === CaveLeech) return 'leech';
  if (c === BloodBat) return 'bat';
  if (c === Vampire) return 'vampire';
  if (c === CaveAsp) return 'asp';
  if (c === KoboldTunnelGuard || c === KoboldHookBearer || c === KoboldSalvekeeper) return 'kobold';
  if (c === GnomeArcher || c === GnomeWarlock) return 'gnome';
  if (c === Ogre || c === OgreMage) return 'ogre';
  if (c === Skeleton || c === AshenSkeleton || c === SkeletonArcher || c === SkeletonMage) return 'skeleton';
  return 'goblin';
}
const multipliers: Record<DungeonBiome, Record<ReturnType<typeof family>, number>> = {
  fungal: {goblin: 1.1, kobold: .9, gnome: .8, ogre: .8, skeleton: .6, beetle: .7, spider: 1.4, wisp: .6, leech: 1.5, bat: .7, vampire: .2, asp: 1},
  cavern: {goblin: 1, kobold: 1.5, gnome: 1, ogre: 1.5, skeleton: .6, beetle: 1.8, spider: 1.5, wisp: 1.2, leech: 1.5, bat: 1.5, vampire: .4, asp: 1.6},
  undercroft: {goblin: 1, kobold: .8, gnome: 1.4, ogre: .7, skeleton: 1.7, beetle: 0, spider: .6, wisp: 1.6, leech: .4, bat: .6, vampire: 1.8, asp: .3},
  emberworks: {goblin: 1.1, kobold: 1.6, gnome: 1.3, ogre: 1.1, skeleton: 1, beetle: 2.5, spider: .3, wisp: .8, leech: .2, bat: .5, vampire: .5, asp: .2},
};
function biomeTable(depth: number, biome: DungeonBiome): Array<readonly [NpcConstructor, number]> {
  return tables[depth]
    .map(([constructor, weight]) => [constructor, Math.round(weight * multipliers[biome][family(constructor)])] as const)
    .filter(([, weight]) => weight > 0);
}

function pick<T>(values: readonly T[], random: Random): T {
  return values[Math.floor(random() * values.length)];
}

function availableAtDepth(depth: number, constructors: readonly NpcConstructor[]): NpcConstructor[] {
  return constructors.filter(Constructor => tables[depth].some(([candidate]) => candidate === Constructor));
}

function petsFor(depth: number, biome: DungeonBiome): NpcConstructor[] {
  const byBiome: Record<DungeonBiome, NpcConstructor[]> = {
    fungal: [SteamBeetle, CaveLeech, CaveAsp, PhaseSpider],
    cavern: [SteamBeetle, BloodBat, CaveAsp, PhaseSpider],
    undercroft: [BloodBat, CaveAsp],
    emberworks: [SteamBeetle, BloodBat],
  };
  return availableAtDepth(depth, byBiome[biome]);
}

export function rollMonsterPack(
  leader: NpcConstructor,
  depth: number,
  biome: DungeonBiome,
  random: Random,
): NpcConstructor[] {
  const leaderFamily = family(leader);
  if (leaderFamily === 'beetle' || leaderFamily === 'bat') {
    return Array.from({length: 3 + Math.floor(random() * 3)}, () => leader);
  }
  if (leaderFamily === 'spider') {
    return Array.from({length: 2 + Math.floor(random() * 2)}, () => leader);
  }
  if (leaderFamily === 'vampire') {
    return [leader, ...Array.from({length: 1 + Math.floor(random() * 2)}, () => BloodBat)];
  }

  let members: NpcConstructor[];
  let size: number;
  if (leaderFamily === 'goblin') {
    members = availableAtDepth(depth, [Goblin, GoblinSkirmisher, GoblinHunter, GoblinMage]);
    size = 3 + Math.floor(random() * 3);
  } else if (leaderFamily === 'kobold') {
    members = availableAtDepth(depth, [KoboldTunnelGuard, KoboldHookBearer, KoboldSalvekeeper]);
    size = 3 + Math.floor(random() * 3);
  } else if (leaderFamily === 'gnome') {
    members = availableAtDepth(depth, [GnomeArcher, KoboldTunnelGuard]);
    size = 2 + Math.floor(random() * 3);
  } else if (leaderFamily === 'ogre') {
    members = availableAtDepth(depth, [Ogre, OgreMage, Goblin, GoblinSkirmisher]);
    size = 2 + Math.floor(random() * 2);
  } else if (leaderFamily === 'skeleton') {
    members = availableAtDepth(depth, [Skeleton, AshenSkeleton, SkeletonArcher, SkeletonMage]);
    size = 2 + Math.floor(random() * 3);
  } else {
    return [leader];
  }

  const pack = [leader];
  while (pack.length < size) pack.push(pick(members, random));
  const pets = petsFor(depth, biome);
  if (leaderFamily !== 'skeleton' && pets.length && pack.length > 1 && random() < .4) {
    pack[pack.length - 1] = pick(pets, random);
  }
  return pack;
}
function structureTable(request: EncounterRequest, depth: number): NpcConstructor[] {
  if (request.kind === 'goblin-post') {
    return [
      Goblin, GoblinSkirmisher, GoblinHunter, GoblinMage,
      KoboldTunnelGuard, KoboldHookBearer, KoboldSalvekeeper, GnomeArcher,
    ];
  }
  if (request.kind === 'skeleton-crypt') return depth >= 3 ? [Skeleton, AshenSkeleton, SkeletonArcher, SkeletonMage] : [];
  if (request.kind === 'ogre-den') return depth >= 2 ? [Ogre, OgreMage, Goblin] : [];
  return [];
}
export function rollMonsterModifierCount(depth: number, roll: number): number {
  if (roll < .45) return 0;
  if (roll < .7) return 1;
  if (roll < .9) return 2;
  if (depth < 3 || roll < .98) return 3;
  if (roll < .995) return 4;
  return 5;
}

function applyModifiers(npc: Npc, depth: number, random: Random): void {
  if (npc instanceof EmberworkMechanism || npc instanceof BoundFamiliar) {
    npc.hp = npc.getMaxHp();
    return;
  }
  const roll = random();
  const count = rollMonsterModifierCount(depth, roll);
  const available = [...modifiers[depth]].filter(Modifier =>
    Modifier !== VampiricMonsterModifier || npc.getIsBloody() && npc.getLifeStealPercent() === 0,
  );
  for (let i = 0; i < count && available.length; i++) {
    const index = Math.floor(random() * available.length);
    npc.applyModifier(new (available.splice(index, 1)[0])());
  }
  npc.hp = npc.getMaxHp();
}
export function populateDungeon(context: Context, level: Level, draft: DungeonDraft, depth: number, random: Random): void {
  const reached = reachableTiles(draft);
  const owner = new Map<SerializedPosition, number>();
  for (const region of draft.regions) for (const position of region.floor) owner.set(position.serialize(), region.id);
  const pool = new Map<SerializedPosition, Position>();
  for (const serialized of reached) {
    const position = Position.deserialize(serialized);
    const region = draft.regions[owner.get(serialized) ?? 0];
    const valid = position.manhattanDistanceTo(draft.upstairs) > 10 &&
      !position.equals(draft.downstairs) &&
      !level.getNpcAt(position) &&
      region.purpose !== 'treasure' &&
      draft.tiles[position.x][position.y]!.isNavigable();
    if (valid) pool.set(serialized, position);
  }
  const take = (candidates: Position[]): Position | undefined => {
    const choices = candidates.filter(position => pool.has(position.serialize()));
    if (!choices.length) return undefined;
    const position = choices[Math.floor(random() * choices.length)];
    pool.delete(position.serialize());
    return position;
  };
  const spawn = (Constructor: NpcConstructor, position: Position) => {
    const npc = new Constructor(context, level, position);
    applyModifiers(npc, depth, random);
    level.putNpc(npc);
  };
  let ordinary = 0;
  const mechanismCandidates = draft.regions
    .filter(region => region.kind === 'room' && region.purpose !== 'treasure')
    .sort((a, b) => Number(b.biome === DungeonBiome.Emberworks) - Number(a.biome === DungeonBiome.Emberworks))
    .flatMap(region => region.floor)
    .filter(position => {
      const tile = draft.tiles[position.x]?.[position.y];
      return tile instanceof CaveFloorTile || tile instanceof MoldFloorTile ||
        tile instanceof FlagstoneFloorTile || tile instanceof EmberworksFloorTile;
    })
    .filter(position => [position.up(), position.right(), position.down(), position.left()]
      .filter(neighbour => draft.tiles[neighbour.x]?.[neighbour.y]?.isNavigable()).length >= 3);
  const mechanisms: NpcConstructor[] = [WarmthFountain, RimeProjector, EmberTurret, EmberTurret];
  for (const Constructor of mechanisms) {
    const position = take(mechanismCandidates);
    if (!position) break;
    spawn(Constructor, position);
    ordinary++;
  }
  for (const request of draft.encounters) {
    const legal = structureTable(request, depth);
    const region = draft.regions[request.regionId];
    const candidates = region.floor.slice().sort(
      (a, b) => a.manhattanDistanceTo(request.anchor) - b.manhattanDistanceTo(request.anchor),
    );
    for (let i = 0; i < request.desiredCount && ordinary < STRUCTURE_NPC_BUDGET; i++) {
      const position = take(candidates);
      if (!position || !legal.length) break;
      spawn(legal[Math.floor(random() * legal.length)], position);
      ordinary++;
    }
  }
  const groupEnd = ordinary + Math.min(BIOME_GROUP_NPC_BUDGET, ORDINARY_DUNGEON_NPC_TARGET - ordinary);
  while (ordinary < groupEnd && pool.size) {
    const anchor = take(Array.from(pool.values()));
    if (!anchor) break;
    const region = draft.regions[owner.get(anchor.serialize()) ?? 0];
    const leader = weightedChoice(biomeTable(depth, region.biome!), random);
    const pack = rollMonsterPack(leader, depth, region.biome!, random);
    spawn(pack[0], anchor);
    ordinary++;
    const nearby = region.floor.slice().sort(
      (a, b) => a.manhattanDistanceTo(anchor) - b.manhattanDistanceTo(anchor),
    );
    for (let i = 1; i < pack.length && ordinary < groupEnd; i++) {
      const position = take(nearby);
      if (!position) break;
      spawn(pack[i], position);
      ordinary++;
    }
  }
  while (ordinary < ORDINARY_DUNGEON_NPC_TARGET && pool.size) {
    const position = take(Array.from(pool.values()));
    if (!position) break;
    const region = draft.regions[owner.get(position.serialize()) ?? 0];
    spawn(weightedChoice(biomeTable(depth, region.biome!), random), position);
    ordinary++;
  }
  for (let i = 0; i < 4 && pool.size; i++) {
    const position = take(Array.from(pool.values()));
    if (position) level.putNpc(new TreasureGoblin(context, level, position, 14 + 10 * (depth - 1)));
  }
}

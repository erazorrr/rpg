import {Position} from '../../io/position';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {CrystalClusterTile} from '../tiles/crystal-cluster.tile';
import {EmberworksFloorTile} from '../tiles/emberworks-floor.tile';
import {FlagstoneFloorTile} from '../tiles/flagstone-floor.tile';
import {MoldFloorTile} from '../tiles/mold-floor.tile';
import {PressureValveTile} from '../tiles/pressure-valve.tile';
import {SporePodTile} from '../tiles/spore-pod.tile';
import {Tile} from '../tiles/abstract.tile';
import {DungeonBiome, DungeonDraft, DungeonRegion, Random} from './dungeon-layout';
import {validateDungeonTerrain} from './dungeon-validation';
import {ThornFungusTile} from '../tiles/thorn-fungus.tile';
import {FrostGeodeTile} from '../tiles/frost-geode.tile';
import {AshUrnTile} from '../tiles/ash-urn.tile';
import {SmokingBrazierTile} from '../tiles/smoking-brazier.tile';
import {SearingGrateTile} from '../tiles/searing-grate.tile';

export type DungeonInteractionCounts = {
  sporePods: number;
  thornFungi: number;
  crystalClusters: number;
  frostGeodes: number;
  ashUrns: number;
  smokingBraziers: number;
  pressureValves: number;
  searingGrates: number;
};

type Candidate = {room: DungeonRegion; position: Position};

function candidates(
  draft: DungeonDraft,
  biome: DungeonBiome,
  FloorType: new () => Tile,
): Candidate[] {
  return draft.regions
    .filter(region => region.kind === 'room' && region.biome === biome && !region.purpose && !region.pattern)
    .flatMap(room => room.floor.map(position => ({room, position})))
    .filter(({position}) => draft.tiles[position.x][position.y] instanceof FloorType)
    .filter(({position}) => !draft.reserved.has(position.serialize()))
    .filter(({position}) => position.manhattanDistanceTo(draft.upstairs) > 8)
    .filter(({position}) => position.manhattanDistanceTo(draft.downstairs) > 8);
}

function pick<T>(values: T[], random: Random): T | undefined {
  if (!values.length) return undefined;
  return values.splice(Math.floor(random() * values.length), 1)[0];
}

function desiredCount(available: Candidate[]): number {
  return Math.min(8, Math.max(2, Math.round(available.length / 500)));
}

function byDistrict(available: Candidate[]): Candidate[][] {
  const groups = new Map<number, Candidate[]>();
  for (const candidate of available) {
    const district = candidate.room.districtId!;
    const group = groups.get(district) ?? [];
    group.push(candidate);
    groups.set(district, group);
  }
  return Array.from(groups.values());
}

function removeNearby(available: Candidate[], position: Position): void {
  for (let i = available.length - 1; i >= 0; i--) {
    if (available[i].position.manhattanDistanceTo(position) <= 4) available.splice(i, 1);
  }
}

function placeBlocking(
  draft: DungeonDraft,
  available: Array<{room: DungeonRegion; position: Position}>,
  random: Random,
  create: () => Tile,
): Position | undefined {
  while (available.length) {
    const candidate = pick(available, random)!;
    const previous = draft.tiles[candidate.position.x][candidate.position.y]!;
    draft.tiles[candidate.position.x][candidate.position.y] = create();
    try {
      validateDungeonTerrain(draft);
      removeNearby(available, candidate.position);
      return candidate.position;
    } catch {
      draft.tiles[candidate.position.x][candidate.position.y] = previous;
    }
  }
  return undefined;
}

export function addBiomeInteractions(draft: DungeonDraft, random: Random): DungeonInteractionCounts {
  const counts: DungeonInteractionCounts = {
    sporePods: 0,
    thornFungi: 0,
    crystalClusters: 0,
    frostGeodes: 0,
    ashUrns: 0,
    smokingBraziers: 0,
    pressureValves: 0,
    searingGrates: 0,
  };
  for (const fungal of byDistrict(candidates(draft, DungeonBiome.Fungal, MoldFloorTile))) {
    const desired = desiredCount(fungal);
    const offset = random() < .5 ? 0 : 1;
    for (let i = 0; i < desired && fungal.length; i++) {
      const candidate = pick(fungal, random)!;
      const pod = (i + offset) % 2 === 0;
      draft.tiles[candidate.position.x][candidate.position.y] = pod
        ? new SporePodTile()
        : new ThornFungusTile();
      if (pod) counts.sporePods++;
      else counts.thornFungi++;
      removeNearby(fungal, candidate.position);
    }
  }

  for (const cavern of byDistrict(candidates(draft, DungeonBiome.Cavern, CaveFloorTile))) {
    const desired = desiredCount(cavern);
    const offset = random() < .5 ? 0 : 1;
    for (let i = 0; i < desired && cavern.length; i++) {
      const cluster = (i + offset) % 2 === 0;
      const placed = placeBlocking(
        draft,
        cavern,
        random,
        cluster ? () => new CrystalClusterTile() : () => new FrostGeodeTile(),
      );
      if (!placed) break;
      if (cluster) counts.crystalClusters++;
      else counts.frostGeodes++;
    }
  }

  for (const undercroft of byDistrict(candidates(draft, DungeonBiome.Undercroft, FlagstoneFloorTile))) {
    const desired = desiredCount(undercroft);
    const offset = random() < .5 ? 0 : 1;
    for (let i = 0; i < desired && undercroft.length; i++) {
      const urn = (i + offset) % 2 === 0;
      const placed = placeBlocking(
        draft,
        undercroft,
        random,
        urn ? () => new AshUrnTile() : () => SmokingBrazierTile.withRandomDescription(random),
      );
      if (!placed) break;
      if (urn) counts.ashUrns++;
      else counts.smokingBraziers++;
    }
  }

  for (const emberworks of byDistrict(candidates(draft, DungeonBiome.Emberworks, EmberworksFloorTile))) {
    const desired = desiredCount(emberworks);
    const offset = random() < .5 ? 0 : 1;
    for (let i = 0; i < desired && emberworks.length; i++) {
      const valve = (i + offset) % 2 === 0;
      const candidate = valve ? undefined : pick(emberworks, random);
      const placed = valve
        ? placeBlocking(draft, emberworks, random, () => new PressureValveTile())
        : candidate?.position;
      if (!placed) break;
      if (valve) counts.pressureValves++;
      else {
        draft.tiles[placed.x][placed.y] = new SearingGrateTile();
        counts.searingGrates++;
        removeNearby(emberworks, placed);
      }
    }
  }
  return counts;
}

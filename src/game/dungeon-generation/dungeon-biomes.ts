import {Position} from '../../io/position';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {FlagstoneFloorTile} from '../tiles/flagstone-floor.tile';
import {MasonryWallTile} from '../tiles/masonry-wall.tile';
import {MoldFloorTile} from '../tiles/mold-floor.tile';
import {MossWallTile} from '../tiles/moss-wall.tile';
import {RoughWallTile} from '../tiles/rough-wall.tile';
import {StairsDownTile} from '../tiles/stairs-down.tile';
import {StairsUpTile} from '../tiles/stairs-up.tile';
import {WallTile} from '../tiles/wall.tile';
import {Tile} from '../tiles/abstract.tile';
import {EmberworksFloorTile} from '../tiles/emberworks-floor.tile';
import {PipeWallTile} from '../tiles/pipe-wall.tile';
import {DungeonBiome, DungeonDraft, DungeonRegion, Random} from './dungeon-layout';
import {GlowingMushroomTile} from '../tiles/glowing-mushroom.tile';
import {CrystalSeamTile} from '../tiles/crystal-seam.tile';
import {MosaicFloorTile} from '../tiles/mosaic-floor.tile';
import {HeatGrateTile} from '../tiles/heat-grate.tile';
import {SporePodTile} from '../tiles/spore-pod.tile';
import {ThornFungusTile} from '../tiles/thorn-fungus.tile';
import {CrystalClusterTile} from '../tiles/crystal-cluster.tile';
import {FrostGeodeTile} from '../tiles/frost-geode.tile';
import {AshUrnTile} from '../tiles/ash-urn.tile';
import {SearingGrateTile} from '../tiles/searing-grate.tile';
import {PressureValveTile} from '../tiles/pressure-valve.tile';

const discoveryMessages: Record<DungeonBiome, readonly string[]> = {
  [DungeonBiome.Fungal]: [
    'Damp mold marks a fungal overgrowth.',
    'Pale growths crowd this fungal overgrowth.',
    'Cool spores drift through a fungal overgrowth.',
    'Glowing caps reveal a fungal overgrowth.',
  ],
  [DungeonBiome.Cavern]: [
    'Rough stone opens into a cavern.',
    'Jagged walls mark a rough cavern.',
    'Loose scree covers this rough cavern.',
    'Natural stone replaces masonry in a rough cavern.',
  ],
  [DungeonBiome.Undercroft]: [
    'Flagstones mark a castle undercroft.',
    'Ancient masonry encloses a castle undercroft.',
    'Fitted stonework marks a castle undercroft.',
    'Worn flagstones cross a castle undercroft.',
  ],
  [DungeonBiome.Emberworks]: [
    'Brass pipes and iron grates mark the Emberworks.',
    'Patched regulators crowd an Emberworks district.',
    'Warm pipes thread through the old Veyran masonry.',
    'Salvaged machinery fills the castle service works.',
  ],
};

const ambienceMessages: Record<DungeonBiome, readonly string[]> = {
  [DungeonBiome.Fungal]: [
    'The air smells of wet earth and sweet rot.',
    'Cool spores prickle in your throat.',
    'Droplets patter softly from cap to cap.',
    'The mold yields with a faint sigh beneath your boots.',
    'Blue-green light pulses through the crowded growths.',
    'Clammy air settles against your skin.',
    'A web of pale mycelium trembles underfoot.',
    'Each breath carries the taste of dark loam.',
    'Unseen water trickles beneath the fungal beds.',
    'The Deep Ember\'s warmth gathers in the damp air.',
    'A swollen cap releases a veil of silver spores.',
    'A sour scent rises from bruised mold.',
    'Thick growth muffles the sound of your steps.',
    'Pale spores swirl in your wake.',
    'Moisture beads on every nearby surface.',
  ],
  [DungeonBiome.Cavern]: [
    'Water drips somewhere beyond the light.',
    'A mineral-cold draft moves through the stone.',
    'Loose gravel shifts beneath your boots.',
    'Your footfalls return as broken echoes.',
    'The air tastes faintly of iron.',
    'A distant crack travels through the rock.',
    'Cold moisture gathers on the cavern walls.',
    'A thin current of air brushes past your face.',
    'Pebbles tick down an unseen slope.',
    'The ceiling vanishes into echoing darkness.',
    'The rough stone draws warmth from your hand.',
    'A shallow draft carries the smell of wet limestone.',
    'Somewhere ahead, falling water murmurs steadily.',
    'Dust grates softly beneath each step.',
    'The cavern air opens cold and vast around you.',
  ],
  [DungeonBiome.Undercroft]: [
    'Each footstep returns in measured echoes.',
    'Dry dust and old mortar hang in the still air.',
    'A cool draft slips between fitted stones.',
    'Your boots strike the flagstones with a hollow ring.',
    'The masonry holds the faint smell of ancient smoke.',
    'Dust stirs in the seams between worn flagstones.',
    'The air is close, dry, and undisturbed.',
    'A distant drop of water echoes along the passage.',
    'The ordered pillars divide darkness into narrow bays.',
    'Old stone presses its chill through your soles.',
    'A trace of lamp soot lingers on the ceiling.',
    'The passage carries every rustle of your equipment.',
    'Fine grit whispers across the flagstones in a draft.',
    'The walls smell faintly of lime and cold ash.',
    'Silence gathers beneath the low masonry vaults.',
  ],
  [DungeonBiome.Emberworks]: [
    'Warm lake water knocks inside a patched pipe.',
    'A brass regulator ticks beneath layers of repair solder.',
    'Deep Ember heat trembles through the iron grating.',
    'Steam sighs through a joint wrapped in Veyran cloth.',
    'A salvaged Cyranthian gauge quivers above the red line.',
    'Condensation beads upon the old castle masonry.',
    'A pump drives warm water toward the inhabited chambers.',
    'Uneven gears turn somewhere behind the pipe-lined wall.',
    'The metal floor carries the slow pulse of buried machinery.',
    'Mineral-stained water drips from an improvised coupling.',
    'Fresh tool marks score a much older stone support.',
    'A pressure valve chatters, then falls abruptly silent.',
    'Heat from below makes the patched brass creak.',
    'The air smells of hot iron, lake water, and lamp grease.',
    'Steam curls from a seam and vanishes into the dark.',
  ],
};

export function getDungeonBiomeForFloor(tile: Tile | undefined): DungeonBiome | undefined {
  if (tile instanceof MoldFloorTile) return DungeonBiome.Fungal;
  if (tile instanceof CaveFloorTile) return DungeonBiome.Cavern;
  if (tile instanceof FlagstoneFloorTile) return DungeonBiome.Undercroft;
  if (tile instanceof EmberworksFloorTile) return DungeonBiome.Emberworks;
  if (tile instanceof GlowingMushroomTile) return DungeonBiome.Fungal;
  if (tile instanceof CrystalSeamTile) return DungeonBiome.Cavern;
  if (tile instanceof MosaicFloorTile) return DungeonBiome.Undercroft;
  if (tile instanceof HeatGrateTile) return DungeonBiome.Emberworks;
  if (tile instanceof SporePodTile || tile instanceof ThornFungusTile) return DungeonBiome.Fungal;
  if (tile instanceof CrystalClusterTile || tile instanceof FrostGeodeTile) return DungeonBiome.Cavern;
  if (tile instanceof AshUrnTile) return DungeonBiome.Undercroft;
  if (tile instanceof SearingGrateTile || tile instanceof PressureValveTile) return DungeonBiome.Emberworks;
  return undefined;
}

export function getDungeonBiomeDiscoveryMessage(
  biome: DungeonBiome,
  random: Random = Math.random,
): string {
  const messages = discoveryMessages[biome];
  return messages[Math.floor(random() * messages.length)];
}

export function getDungeonBiomeAmbienceMessage(
  biome: DungeonBiome,
  random: Random = Math.random,
): string {
  const messages = ambienceMessages[biome];
  return messages[Math.floor(random() * messages.length)];
}

const weights: Record<number, Array<readonly [DungeonBiome, number]>> = {
  1: [[DungeonBiome.Fungal, 3], [DungeonBiome.Cavern, 2], [DungeonBiome.Undercroft, 5]],
  2: [[DungeonBiome.Fungal, 4], [DungeonBiome.Cavern, 4], [DungeonBiome.Undercroft, 2], [DungeonBiome.Emberworks, 1]],
  3: [[DungeonBiome.Fungal, 2], [DungeonBiome.Cavern, 3], [DungeonBiome.Undercroft, 5], [DungeonBiome.Emberworks, 1]],
};

export function weightedChoice<T>(entries: ReadonlyArray<readonly [T, number]>, random: Random): T {
  const valid = entries.filter(([, weight]) => weight > 0);
  if (!valid.length) throw new Error('Cannot choose from an empty weighted table');
  const total = valid.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of valid) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return valid[valid.length - 1][0];
}

function distances(regions: DungeonRegion[], start: number): Map<number, number> {
  const result = new Map<number, number>([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const id = queue.shift()!;
    for (const neighbour of regions[id].neighbours) {
      if (result.has(neighbour)) continue;
      result.set(neighbour, result.get(id)! + 1);
      queue.push(neighbour);
    }
  }
  return result;
}

export function assignDungeonBiomes(draft: DungeonDraft, depth: number, random: Random): void {
  const rooms = draft.regions.filter(region => region.kind === 'room');
  const count = Math.min(rooms.length, Math.max(3, Math.min(5, Math.round(rooms.length / 18))));
  const fromStart = distances(draft.regions, 0);
  const ordered = [...rooms].sort((a, b) => fromStart.get(a.id)! - fromStart.get(b.id)!);
  const seeds = [ordered[Math.min(ordered.length - 1, Math.floor(ordered.length / 4))]];
  const seedDistances = [distances(draft.regions, seeds[0].id)];
  const nearestSeedDistance = new Map(seedDistances[0]);
  while (seeds.length < count) {
    const unselected = rooms.filter(room => !seeds.includes(room));
    const next = unselected.reduce((farthest, room) =>
      nearestSeedDistance.get(room.id)! > nearestSeedDistance.get(farthest.id)! ? room : farthest,
    );
    seeds.push(next);
    const nextDistances = distances(draft.regions, next.id);
    seedDistances.push(nextDistances);
    for (const region of draft.regions) {
      nearestSeedDistance.set(
        region.id,
        Math.min(nearestSeedDistance.get(region.id)!, nextDistances.get(region.id)!),
      );
    }
  }
  const seedBiomes = seeds.map(() => weightedChoice(weights[depth], random));
  if (seedBiomes.length > 1 && seedBiomes.every(biome => biome === seedBiomes[0])) {
    const alternatives = weights[depth].map(([biome]) => biome)
      .filter(biome => biome !== seedBiomes[0]);
    seedBiomes[seedBiomes.length - 1] = alternatives[Math.floor(random() * alternatives.length)];
  }
  for (const region of draft.regions) {
    let district = 0;
    for (let i = 1; i < seeds.length; i++) {
      if (seedDistances[i].get(region.id)! < seedDistances[district].get(region.id)!) district = i;
    }
    region.districtId = district;
    region.biome = seedBiomes[district];
  }
}

export function applyDungeonBiomes(draft: DungeonDraft, random: Random): void {
  const owner = new Map<string, DungeonRegion>();
  const districtPipeWalls = new Map<number, PipeWallTile>();
  for (const region of draft.regions) for (const position of region.floor) {
    owner.set(position.serialize(), region);
    const old = draft.tiles[position.x][position.y];
    if (old instanceof StairsUpTile || old instanceof StairsDownTile) continue;
    draft.tiles[position.x][position.y] = region.biome === DungeonBiome.Fungal
      ? new MoldFloorTile()
      : region.biome === DungeonBiome.Cavern
        ? new CaveFloorTile()
        : region.biome === DungeonBiome.Emberworks
          ? new EmberworksFloorTile()
          : new FlagstoneFloorTile();
  }
  for (const region of draft.regions) {
    if (
      region.kind === 'corridor' ||
      region.biome === DungeonBiome.Undercroft ||
      region.biome === DungeonBiome.Emberworks
    ) continue;
    const probability = region.biome === DungeonBiome.Cavern ? .18 : .08;
    for (const position of region.floor) {
      const perimeter = position.x === region.topLeft.x || position.x === region.bottomRight.x ||
        position.y === region.topLeft.y || position.y === region.bottomRight.y;
      if (!perimeter || draft.reserved.has(position.serialize()) || random() >= probability) continue;
      const neighbours = [position.up(), position.down(), position.left(), position.right()]
        .filter(neighbour => draft.tiles[neighbour.x]?.[neighbour.y]?.isNavigable());
      if (neighbours.length < 2) continue;
      draft.tiles[position.x][position.y] = region.biome === DungeonBiome.Cavern
        ? new RoughWallTile()
        : new MossWallTile();
    }
  }
  for (let x = 0; x < draft.tiles.length; x++) for (let y = 0; y < draft.tiles[0].length; y++) {
    if (draft.tiles[x][y]) continue;
    const adjacent = [new Position(x, y - 1), new Position(x, y + 1), new Position(x - 1, y), new Position(x + 1, y)]
      .map(position => owner.get(position.serialize()))
      .filter(Boolean)
      .sort((a, b) => a!.id - b!.id);
    if (!adjacent.length) draft.tiles[x][y] = new WallTile();
    else if (adjacent[0]!.biome === DungeonBiome.Fungal) draft.tiles[x][y] = new MossWallTile();
    else if (adjacent[0]!.biome === DungeonBiome.Cavern) draft.tiles[x][y] = new RoughWallTile();
    else if (adjacent[0]!.biome === DungeonBiome.Emberworks) {
      const districtId = adjacent[0]!.districtId ?? adjacent[0]!.id;
      let pipeWall = districtPipeWalls.get(districtId);
      if (!pipeWall) {
        pipeWall = PipeWallTile.withRandomDescription(random);
        districtPipeWalls.set(districtId, pipeWall);
      }
      draft.tiles[x][y] = new PipeWallTile(pipeWall.descriptionId);
    } else draft.tiles[x][y] = new MasonryWallTile();
  }
  addBiomeAccents(draft, random);
}

function addBiomeAccents(draft: DungeonDraft, random: Random): void {
  const constructors: Record<DungeonBiome, () => Tile> = {
    [DungeonBiome.Fungal]: () => GlowingMushroomTile.withRandomDescription(random),
    [DungeonBiome.Cavern]: () => CrystalSeamTile.withRandomDescription(random),
    [DungeonBiome.Undercroft]: () => MosaicFloorTile.withRandomDescription(random),
    [DungeonBiome.Emberworks]: () => HeatGrateTile.withRandomDescription(random),
  };
  const districts = new Map<number, {biome: DungeonBiome; regions: DungeonRegion[]}>();
  for (const region of draft.regions) {
    if (region.biome === undefined || region.districtId === undefined) continue;
    const district = districts.get(region.districtId) ?? {biome: region.biome, regions: []};
    district.regions.push(region);
    districts.set(region.districtId, district);
  }
  for (const {biome, regions} of districts.values()) {
    const expectedFloor = biome === DungeonBiome.Fungal
      ? MoldFloorTile
      : biome === DungeonBiome.Cavern
        ? CaveFloorTile
        : biome === DungeonBiome.Emberworks
          ? EmberworksFloorTile
          : FlagstoneFloorTile;
    const candidates = regions
      .filter(region => region.kind === 'room')
      .flatMap(region => region.floor)
      .filter(position => draft.tiles[position.x][position.y] instanceof expectedFloor)
      .filter(position => !draft.reserved.has(position.serialize()));
    const count = Math.min(12, Math.max(3, Math.round(candidates.length / 250)));
    for (let i = 0; i < count && candidates.length; i++) {
      const index = Math.floor(random() * candidates.length);
      const position = candidates.splice(index, 1)[0];
      draft.tiles[position.x][position.y] = constructors[biome]();
    }
  }
}

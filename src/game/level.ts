import {GameMap} from "./game.map";
import {Npc} from "./npc";
import {Position, SerializedPosition} from "../io/position";
import {Item} from "./item";
import {Tile} from "./tiles/abstract.tile";
import {LevelSave, Saveable} from "./save-data";
import {getDungeonBiomeForFloor} from "./dungeon-generation/dungeon-biomes";
import {DungeonBiome} from "./dungeon-generation/dungeon-layout";
import {AtmosphereCell, AtmosphereEmission, atmosphereDriftPeriod, CardinalDirection} from './atmosphere';

export class Level implements Saveable<LevelSave> {
  private npcs: Npc[] = [];
  private items: Map<SerializedPosition, Item> = new Map();
  private atmosphere: Map<SerializedPosition, AtmosphereCell> = new Map();
  private freshAtmosphere: Set<SerializedPosition> = new Set();
  private atmosphereTurn = 0;
  private discoveredDungeonBiomes: Set<DungeonBiome> = new Set();

  constructor(public levelNo: number, public map: GameMap) {
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const tile = map.getTile(new Position(x, y));
        const biome = tile?.isExplored() ? getDungeonBiomeForFloor(tile) : undefined;
        if (biome) this.discoveredDungeonBiomes.add(biome);
      }
    }
  }

  public discoverDungeonBiome(biome: DungeonBiome): boolean {
    if (this.discoveredDungeonBiomes.has(biome)) return false;
    this.discoveredDungeonBiomes.add(biome);
    return true;
  }

  public usesFogOfWar(): boolean {
    return this.levelNo > 0;
  }

  public getItem(position: Position): Item | undefined {
    return this.items.get(position.serialize());
  }

  public getNpcAt(position: Position) {
    for (const npc of this.npcs) {
      if (npc.position.equals(position)) return npc;
    }
    return null;
  }

  public removeNpc(npc: Npc) {
    this.npcs = this.npcs.filter(n => n !== npc);
  }

  public removeItem(position: Position) {
    this.items.delete(position.serialize());
  }

  public putItem(position: Position, item: Item) {
    this.items.set(position.serialize(), item);
  }

  public getAtmosphere(position: Position): AtmosphereCell | undefined {
    return this.atmosphere.get(position.serialize());
  }

  public getAtmosphereAndPositions() {
    return this.atmosphere.entries();
  }

  public restoreAtmosphereTurn(turn: number): void {
    this.atmosphereTurn = turn;
  }

  public putAtmosphere(position: Position, cell: AtmosphereCell, fresh = true): void {
    if (!this.map.isNavigable(position)) return;
    const key = position.serialize();
    const existing = this.atmosphere.get(key);
    if (!existing || cell.density >= existing.density) {
      this.atmosphere.set(key, {...cell});
    } else if (existing.kind === cell.kind) {
      existing.turnsLeft = Math.max(existing.turnsLeft, cell.turnsLeft);
    }
    if (fresh) this.freshAtmosphere.add(key);
  }

  public emitAtmosphere(origin: Position, emission: AtmosphereEmission): void {
    const directions: CardinalDirection[] = ['up', 'right', 'down', 'left'];
    const drift = directions[Math.floor(Math.random() * directions.length)];
    const positions = emission.shape === 'cross'
      ? [origin, origin.up(), origin.right(), origin.down(), origin.left()]
      : [origin];
    for (const position of positions) {
      this.putAtmosphere(position, {
        kind: emission.kind,
        turnsLeft: emission.turns,
        density: emission.density,
        drift,
        driftIn: atmosphereDriftPeriod(emission.kind),
      });
    }
  }

  private drift(position: Position, direction: CardinalDirection): Position {
    if (direction === 'up') return position.up();
    if (direction === 'down') return position.down();
    if (direction === 'left') return position.left();
    return position.right();
  }

  public tickAtmosphere(): void {
    const next = new Map<SerializedPosition, AtmosphereCell>();
    const merge = (position: Position, cell: AtmosphereCell) => {
      if (!this.map.isNavigable(position)) return;
      const key = position.serialize();
      const existing = next.get(key);
      if (!existing || cell.density >= existing.density) next.set(key, cell);
      else if (existing.kind === cell.kind) existing.turnsLeft = Math.max(existing.turnsLeft, cell.turnsLeft);
    };
    for (const [key, original] of this.atmosphere) {
      if (this.freshAtmosphere.has(key)) {
        merge(Position.deserialize(key), {...original});
        continue;
      }
      const cell = {...original, turnsLeft: original.turnsLeft - 1, driftIn: original.driftIn - 1};
      if (cell.turnsLeft <= 0) continue;
      let position = Position.deserialize(key);
      if (cell.driftIn <= 0) {
        const destination = this.drift(position, cell.drift);
        if (this.map.isNavigable(destination)) position = destination;
        cell.driftIn = atmosphereDriftPeriod(cell.kind);
      }
      merge(position, cell);
    }
    this.atmosphere = next;
    this.freshAtmosphere.clear();
    this.atmosphereTurn++;
    this.emitFromTiles();
  }

  private emitFromTiles(): void {
    for (let x = 0; x < this.map.width; x++) for (let y = 0; y < this.map.height; y++) {
      const source = this.map.getTile(new Position(x, y))?.getAtmosphereSource();
      if (!source || (this.atmosphereTurn + x * 3 + y * 5) % source.period !== 0) continue;
      const origin = new Position(x, y);
      const nearby = Array.from(this.atmosphere.entries()).filter(([key, cell]) =>
        cell.kind === source.emission.kind && Position.deserialize(key).manhattanDistanceTo(origin) <= 3,
      ).length;
      if (nearby < source.maxNearby) this.emitAtmosphere(origin, source.emission);
    }
  }

  public putNpc(npc: Npc) {
    this.npcs.push(npc);
  }

  public getNpcs() {
    return this.npcs;
  }

  public getItemsAndPositions() {
    return this.items.entries();
  }

  public toSaveData(): LevelSave {
    return {
      levelNo: this.levelNo,
      atmosphereTurn: this.atmosphereTurn,
      map: this.map.toSaveData(),
      npcs: this.npcs.map(npc => npc.toSaveData()),
      items: Array.from(this.items.entries()).map(([position, item]) => ({
        position: Position.deserialize(position),
        item: item.toSaveData(),
      })),
      atmosphere: Array.from(this.atmosphere.entries()).map(([position, cell]) => ({
        position: Position.deserialize(position),
        ...cell,
        fresh: this.freshAtmosphere.has(position),
      })),
    };
  }

  public findTile(c: new () => Tile): Position {
    for (let i = 0; i < this.map.width; i++) {
      for (let j = 0; j < this.map.height; j++) {
        if (this.map.getTile(new Position(i, j)) instanceof c) {
          return new Position(i, j);
        }
      }
    }
    return null;
  }
}

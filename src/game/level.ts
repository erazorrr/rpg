import {GameMap} from "./game.map";
import {Npc} from "./npc";
import {Position, SerializedPosition} from "../io/position";
import {Item} from "./item";
import {Tile} from "./tiles/abstract.tile";
import {LevelSave, Saveable} from "./save-data";
import {getDungeonBiomeForFloor} from "./dungeon-generation/dungeon-biomes";
import {DungeonBiome} from "./dungeon-generation/dungeon-layout";

export class Level implements Saveable<LevelSave> {
  private npcs: Npc[] = [];
  private items: Map<SerializedPosition, Item> = new Map();
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
      map: this.map.toSaveData(),
      npcs: this.npcs.map(npc => npc.toSaveData()),
      items: Array.from(this.items.entries()).map(([position, item]) => ({
        position: Position.deserialize(position),
        item: item.toSaveData(),
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

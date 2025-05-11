import {GameMap} from "./game.map";
import {Npc} from "./npc";
import {Position, SerializedPosition} from "../io/position";
import {Item} from "./item";
import {Tile} from "./tiles/abstract.tile";

export class Level {
  private npcs: Npc[] = [];
  private items: Map<SerializedPosition, Item> = new Map();

  constructor(public levelNo: number, public map: GameMap) {
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

import {GameObject} from "./abstract.game-object";
import {Context} from "./context";
import {ItemModifier} from "./item-modifier";
import {Char} from "../io/char";
import {Position} from "../io/position";

export enum ItemType {
  Weapon,
  Chest,
  Gauntlets,
  Boots,
  Ring,
  Amulet,
  Potion
}

export type ItemStats = {
  damageRoll?: number;
  damageBonus?: number;

  armor?: number;

  maxHp?: number;

  strengthBonus?: number;
  dexterityBonus?: number;
  enduranceBonus?: number;

  consumableHpReplenish?: number;
};

export abstract class Item extends GameObject {
  protected constructor(context: Context, public type: ItemType, public stats: ItemStats, public baseCost: number) {
    super(context);
  }

  abstract getChar(): Char;

  renderAt(position: Position) {
    const map = this.context.getCurrentMap();
    const tile = map.getTile(position);
    this.context.getRenderer().put(new Position(position.x - map.getTopLeftCorner().x, position.y - map.getTopLeftCorner().y), {
      ...this.getChar(),
      backgroundColor: tile.getChar().backgroundColor,
    });
  };

  abstract getBaseName(): string;

  private statsNames: Record<keyof ItemStats, string> = {
    damageRoll: 'DMGROLL',
    damageBonus: 'DMGBONUS',
    armor: 'ARM',
    maxHp: 'MAXHP',
    strengthBonus: 'STR',
    dexterityBonus: 'DEX',
    enduranceBonus: 'END',
    consumableHpReplenish: 'HP',
  }
  getName() {
    const prefix = this.modifiers
      .filter(m => m.name.length > 0)
      .filter(m => !m.isSuffix)
      .map(m => m.name).join(" ");
    const suffix = this.modifiers
      .filter(m => m.isSuffix)
      .filter(m => m.name.length > 0)
      .map(m => m.name).join(" and ");
    let params = Object.entries(this.stats)
      .map(([key, value]) => `${this.statsNames[key]}${+value >= 0 ? '+' : ''}${value}`)
      .join(' ');
    return `${prefix ? `${prefix} `: ''}${this.getBaseName()}${suffix ? ` of ${suffix}` : ''}${params ? ` (${params})` : ''}`;

  }

  private modifiers: ItemModifier[] = [];
  applyModifier(modifier: ItemModifier) {
    this.modifiers.push(modifier);
    for (const [key, value] of Object.entries(modifier.stats)) {
      if (!this.stats[key]) {
        this.stats[key] = value;
      } else {
        this.stats[key] += value;
      }
    }
    return this;
  }

  getCost(): number {
    return this.baseCost + this.modifiers.reduce((acc, m) => acc + m.cost, 0);
  }

  clone(): Item {
    const res = new (this.constructor as any)(this.context, this.type, {...this.stats}, this.baseCost);
    for (const modifier of this.modifiers) {
      res.applyModifier(modifier);
    }
    return res;
  }
}

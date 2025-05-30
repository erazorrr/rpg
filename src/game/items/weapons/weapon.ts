import {Item, ItemStats, ItemType} from "../../item";
import {Context} from "../../context";

export abstract class Weapon extends Item {
  protected constructor(context: Context, stats: ItemStats, baseCost: number, public readonly isRanged = false) {
    super(context, ItemType.Weapon, stats, baseCost);
  }
}

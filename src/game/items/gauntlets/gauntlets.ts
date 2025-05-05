import {Item, ItemStats, ItemType} from "../../item";
import {Context} from "../../context";

export abstract class Gauntlets extends Item {
  protected constructor(context: Context, stats: ItemStats, baseCost: number) {
    super(context, ItemType.Gauntlets, stats, baseCost);
  }
}

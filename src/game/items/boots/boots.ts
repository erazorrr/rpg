import {Item, ItemStats, ItemType} from "../../item";
import {Context} from "../../context";

export abstract class Boots extends Item {
  protected constructor(context: Context, stats: ItemStats, baseCost: number) {
    super(context, ItemType.Boots, stats, baseCost);
  }
}

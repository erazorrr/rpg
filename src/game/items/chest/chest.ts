import {Item, ItemStats, ItemType} from "../../item";
import {Context} from "../../context";

export abstract class Chest extends Item {
  protected constructor(context: Context, stats: ItemStats, baseCost: number) {
    super(context, ItemType.Chest, stats, baseCost);
  }
}

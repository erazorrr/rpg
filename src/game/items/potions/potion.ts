import {Item, ItemStats, ItemType} from "../../item";
import {Context} from "../../context";

export abstract class Potion extends Item {
  protected constructor(context: Context, public stats: ItemStats, public baseCost: number) {
    super(context, ItemType.Potion, stats, baseCost);
  }
}

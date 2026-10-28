import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class Wisdom extends ItemModifier {
  public static readonly saveId = "wisdom";

  constructor() {
    super('wisdom', {
      wisdomBonus: 2,
    }, Math.round(PRICE_PER_WISDOM * 2), true);
  }
}

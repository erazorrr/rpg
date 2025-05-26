import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class LeviathanWisdom extends ItemModifier {
  constructor() {
    super('elder wisdom', {
      wisdomBonus: 10,
    }, Math.round(PRICE_PER_WISDOM * 10), true);
  }
}

import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class GiantWisdom extends ItemModifier {
  constructor() {
    super('wizard wisdom', {
      wisdomBonus: 6,
    }, Math.round(PRICE_PER_WISDOM * 6), true);
  }
}

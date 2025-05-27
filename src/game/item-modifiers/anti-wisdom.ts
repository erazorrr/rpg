import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class AntiWisdom extends ItemModifier {
  constructor() {
    super('stupidity', {
      wisdomBonus: -2,
    }, Math.round(PRICE_PER_WISDOM * -2 * 0.5), true);
  }
}

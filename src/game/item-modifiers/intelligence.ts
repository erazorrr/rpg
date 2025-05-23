import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class Intelligence extends ItemModifier {
  constructor() {
    super('intelligence', {
      intelligenceBonus: 2,
    }, Math.round(PRICE_PER_INTELLIGENCE * 2), true);
  }
}

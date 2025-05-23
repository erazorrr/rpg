import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class LeviathanIntelligence extends ItemModifier {
  constructor() {
    super('elder intelligence', {
      intelligenceBonus: 10,
    }, Math.round(PRICE_PER_INTELLIGENCE * 10), true);
  }
}

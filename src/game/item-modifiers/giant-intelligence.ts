import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class GiantIntelligence extends ItemModifier {
  constructor() {
    super('wizard intelligence', {
      intelligenceBonus: 6,
    }, Math.round(PRICE_PER_INTELLIGENCE * 6), true);
  }
}

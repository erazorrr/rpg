import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class AntiIntelligence extends ItemModifier {
  constructor() {
    super('stupidity', {
      intelligenceBonus: -2,
    }, Math.round(PRICE_PER_INTELLIGENCE * -2 * 0.5), true);
  }
}

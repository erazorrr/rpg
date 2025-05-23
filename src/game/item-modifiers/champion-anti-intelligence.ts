import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class ChampionAntiIntelligence extends ItemModifier {
  constructor() {
    super('champion stupidity', {
      intelligenceBonus: -4,
    }, Math.round(PRICE_PER_INTELLIGENCE * -4 * 0.5), true);
  }
}

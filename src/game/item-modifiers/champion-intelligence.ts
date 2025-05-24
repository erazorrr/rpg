import {ItemModifier} from "../item-modifier";
import {PRICE_PER_INTELLIGENCE} from "../prices";

export class ChampionIntelligence extends ItemModifier {
  constructor() {
    super('apprentice intelligence', {
      intelligenceBonus: 4,
    }, Math.round(PRICE_PER_INTELLIGENCE * 4), true);
  }
}

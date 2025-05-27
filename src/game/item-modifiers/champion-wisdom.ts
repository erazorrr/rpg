import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class ChampionWisdom extends ItemModifier {
  constructor() {
    super('apprentice wisdom', {
      wisdomBonus: 4,
    }, Math.round(PRICE_PER_WISDOM * 4), true);
  }
}

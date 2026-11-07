import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class ChampionWisdom extends ItemModifier {
  public static readonly saveId = "champion-wisdom";

  constructor() {
    super('champion wisdom', {
      wisdomBonus: 4,
    }, Math.round(PRICE_PER_WISDOM * 4), true);
  }
}

import {ItemModifier} from "../item-modifier";
import {PRICE_PER_WISDOM} from "../prices";

export class ChampionAntiWisdom extends ItemModifier {
  public static readonly saveId = "champion-anti-wisdom";

  constructor() {
    super('befuddlement', {
      wisdomBonus: -4,
    }, Math.round(PRICE_PER_WISDOM * -4 * 0.5), true);
  }
}

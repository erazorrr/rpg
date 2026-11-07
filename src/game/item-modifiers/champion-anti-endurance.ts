import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class ChampionAntiEndurance extends ItemModifier {
  public static readonly saveId = "champion-anti-endurance";

  constructor() {
    super('frailty', {
      enduranceBonus: -4,
    }, Math.round(PRICE_PER_ENDURANCE * -4 * 0.5), true);
  }
}

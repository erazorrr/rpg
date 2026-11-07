import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class ChampionAntiStrength extends ItemModifier {
  public static readonly saveId = "champion-anti-strength";

  constructor() {
    super('feebleness', {
      strengthBonus: -4,
    }, Math.round(PRICE_PER_STRENGTH * -4 * 0.5), true);
  }
}

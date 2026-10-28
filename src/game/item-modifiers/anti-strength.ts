import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class AntiStrength extends ItemModifier {
  public static readonly saveId = "anti-strength";

  constructor() {
    super('weakness', {
      strengthBonus: -2,
    }, Math.round(PRICE_PER_STRENGTH * -2 * 0.5), true);
  }
}

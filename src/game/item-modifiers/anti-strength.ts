import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class AntiStrength extends ItemModifier {
  constructor() {
    super('weakness', {
      strengthBonus: -2,
    }, Math.round(PRICE_PER_STRENGTH * -2 * 0.5), true);
  }
}

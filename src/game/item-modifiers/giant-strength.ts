import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class GiantStrength extends ItemModifier {
  constructor() {
    super('giant strength', {
      strengthBonus: 6,
    }, Math.round(PRICE_PER_STRENGTH * 6), true);
  }
}

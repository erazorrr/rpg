import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class LeviathanStrength extends ItemModifier {
  constructor() {
    super('leviathan strength', {
      strengthBonus: 10,
    }, Math.round(PRICE_PER_STRENGTH * 10), true);
  }
}

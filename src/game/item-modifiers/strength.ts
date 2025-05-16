import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class Strength extends ItemModifier {
  constructor() {
    super('strength', {
      strengthBonus: 2,
    }, Math.round(PRICE_PER_STRENGTH * 2), true);
  }
}

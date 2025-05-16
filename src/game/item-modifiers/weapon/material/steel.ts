import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_DAMAGE} from "../../../prices";

export class SteelModifier extends ItemModifier {
  constructor() {
    super('Steel', {
      damageBonus: 2,
    }, Math.round(PRICE_PER_DAMAGE * 2));
  }
}

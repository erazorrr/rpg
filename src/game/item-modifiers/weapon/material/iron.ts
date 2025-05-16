import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_DAMAGE} from "../../../prices";

export class IronModifier extends ItemModifier {
  constructor() {
    super('Iron', {
      damageBonus: 1,
    }, Math.round(PRICE_PER_DAMAGE));
  }
}

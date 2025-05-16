import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_DAMAGE} from "../../../prices";

export class CopperModifier extends ItemModifier {
  constructor() {
    super('Copper', {
      damageBonus: -1,
    }, Math.round(PRICE_PER_DAMAGE * -1 * 0.5));
  }
}

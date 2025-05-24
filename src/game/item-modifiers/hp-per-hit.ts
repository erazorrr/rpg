import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class HpPerHit extends ItemModifier {
  constructor() {
    super('health replenishment', {
      hpPerHit: 1
    }, Math.round(8 * PRICE_PER_HP), true);
  }
}

import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class HpPerHit extends ItemModifier {
  constructor() {
    super('health replen', {
      hpPerHit: 1
    }, Math.round(6 * PRICE_PER_HP), true);
  }
}

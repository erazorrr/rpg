import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class Health extends ItemModifier {
  constructor() {
    super('health', {
      maxHp: 5,
    }, Math.round(PRICE_PER_HP * 5), true);
  }
}

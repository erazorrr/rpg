import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP_REPLEN} from "../prices";

export class HpReplen extends ItemModifier {
  constructor() {
    super('regeneration', {
      hpReplenishment: 0.5,
    }, Math.round(PRICE_PER_HP_REPLEN * 30), true);
  }
}

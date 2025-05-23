import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MP_REPLEN} from "../prices";

export class MpReplen extends ItemModifier {
  constructor() {
    super('revitalization', {
      mpReplenishment: 0.5,
    }, Math.round(PRICE_PER_MP_REPLEN * 30), true);
  }
}

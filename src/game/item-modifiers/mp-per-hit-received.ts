import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MANA_POINT} from "../prices";

export class MpPerHitReceived extends ItemModifier {
  constructor() {
    super('archont', {
      mpPerHitReceived: 1,
    }, Math.round(30 * PRICE_PER_MANA_POINT), true);
  }
}

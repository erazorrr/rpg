import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MANA_POINT} from "../prices";

export class MpPerHitReceived extends ItemModifier {
  public static readonly saveId = "mp-per-hit-received";

  constructor() {
    super('archont', {
      mpPerHitReceived: 1,
    }, Math.round(25 * PRICE_PER_MANA_POINT), true);
  }
}

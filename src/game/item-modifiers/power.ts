import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_BONUS} from "../prices";

export class Power extends ItemModifier {
  public static readonly saveId = "power";

  constructor() {
    super('power', {
      magicBonus: 2,
    }, Math.round(PRICE_PER_MAGIC_BONUS * 2), true);
  }
}

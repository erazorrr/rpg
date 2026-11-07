import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_DICE_BONUS} from "../prices";

export class GiantFocus extends ItemModifier {
  public static readonly saveId = "giant-focus";

  constructor() {
    super('legendary focus', {
      magicRoll: 3,
    }, Math.round(PRICE_PER_MAGIC_DICE_BONUS * 3), true);
  }
}

import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_DICE_BONUS} from "../prices";

export class GiantFocus extends ItemModifier {
  constructor() {
    super('legendary focus', {
      magicRoll: 6,
    }, Math.round(PRICE_PER_MAGIC_DICE_BONUS * 6), true);
  }
}

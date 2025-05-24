import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_DICE_BONUS} from "../prices";

export class Focus extends ItemModifier {
  constructor() {
    super('focus', {
      magicRoll: 2,
    }, Math.round(PRICE_PER_MAGIC_DICE_BONUS * 2), true);
  }
}

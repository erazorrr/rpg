import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_DICE_BONUS} from "../prices";

export class ChampionFocus extends ItemModifier {
  constructor() {
    super('great focus', {
      magicRoll: 4,
    }, Math.round(PRICE_PER_MAGIC_DICE_BONUS * 4), true);
  }
}

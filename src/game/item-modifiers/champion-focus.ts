import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_DICE_BONUS} from "../prices";

export class ChampionFocus extends ItemModifier {
  public static readonly saveId = "champion-focus";

  constructor() {
    super('great focus', {
      magicRoll: 2,
    }, Math.round(PRICE_PER_MAGIC_DICE_BONUS * 2), true);
  }
}

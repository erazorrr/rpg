import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_BONUS} from "../prices";

export class GiantPower extends ItemModifier {
  constructor() {
    super('legendary power', {
      magicBonus: 6,
    }, Math.round(PRICE_PER_MAGIC_BONUS * 6), true);
  }
}

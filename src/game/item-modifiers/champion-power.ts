import {ItemModifier} from "../item-modifier";
import {PRICE_PER_MAGIC_BONUS} from "../prices";

export class ChampionPower extends ItemModifier {
  constructor() {
    super('great power', {
      magicBonus: 4,
    }, Math.round(PRICE_PER_MAGIC_BONUS * 4), true);
  }
}

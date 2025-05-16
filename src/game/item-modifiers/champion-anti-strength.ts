import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class ChampionAntiStrength extends ItemModifier {
  constructor() {
    super('champion weakness', {
      strengthBonus: -4,
    }, Math.round(PRICE_PER_STRENGTH * -4 * 0.75), true);
  }
}

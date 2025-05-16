import {ItemModifier} from "../item-modifier";
import {PRICE_PER_STRENGTH} from "../prices";

export class ChampionStrength extends ItemModifier {
  constructor() {
    super('champion strength', {
      strengthBonus: 4,
    }, Math.round(PRICE_PER_STRENGTH * 4), true);
  }
}

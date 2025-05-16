import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class ChampionHealth extends ItemModifier {
  constructor() {
    super('champion health', {
      maxHp: 10,
    }, Math.round(PRICE_PER_HP * 10), true);
  }
}

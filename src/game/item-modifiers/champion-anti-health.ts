import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class ChampionAntiHealth extends ItemModifier {
  constructor() {
    super('champion disease', {
      maxHp: -15,
    }, Math.round(PRICE_PER_HP * -15 * 0.5), true);
  }
}

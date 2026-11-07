import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class ChampionAntiHealth extends ItemModifier {
  public static readonly saveId = "champion-anti-health";

  constructor() {
    super('wasting', {
      maxHp: -10,
    }, Math.round(PRICE_PER_HP * -10 * 0.5), true);
  }
}

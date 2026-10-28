import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class ChampionHpPerHit extends ItemModifier {
  public static readonly saveId = "champion-hp-per-hit";

  constructor() {
    super('champion health replen', {
      hpPerHit: 2
    }, Math.round(15 * PRICE_PER_HP), true);
  }
}

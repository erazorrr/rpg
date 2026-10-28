import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class ChampionEndurance extends ItemModifier {
  public static readonly saveId = "champion-endurance";

  constructor() {
    super('champion endurance', {
      enduranceBonus: 4,
    }, Math.round(PRICE_PER_ENDURANCE * 4), true);
  }
}

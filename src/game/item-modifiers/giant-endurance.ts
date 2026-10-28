import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class GiantEndurance extends ItemModifier {
  public static readonly saveId = "giant-endurance";

  constructor() {
    super('giant endurance', {
      enduranceBonus: 6,
    }, Math.round(PRICE_PER_ENDURANCE * 6), true);
  }
}

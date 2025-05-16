import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class ChampionAntiEndurance extends ItemModifier {
  constructor() {
    super('champion breathlessness', {
      enduranceBonus: -4,
    }, Math.round(PRICE_PER_ENDURANCE * -4 * 0.75), true);
  }
}

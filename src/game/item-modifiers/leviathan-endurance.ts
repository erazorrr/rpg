import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class LeviathanEndurance extends ItemModifier {
  constructor() {
    super('leviathan endurance', {
      enduranceBonus: 10,
    }, Math.round(PRICE_PER_ENDURANCE * 10), true);
  }
}

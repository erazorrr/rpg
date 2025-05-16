import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class AntiEndurance extends ItemModifier {
  constructor() {
    super('breathlessness', {
      enduranceBonus: -2,
    }, Math.round(PRICE_PER_ENDURANCE * -2 * 0.75), true);
  }
}

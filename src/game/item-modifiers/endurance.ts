import {ItemModifier} from "../item-modifier";
import {PRICE_PER_ENDURANCE} from "../prices";

export class Endurance extends ItemModifier {
  constructor() {
    super('endurance', {
      enduranceBonus: 2,
    }, Math.round(PRICE_PER_ENDURANCE * 2), true);
  }
}

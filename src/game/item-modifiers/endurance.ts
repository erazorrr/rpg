import {ItemModifier} from "../item-modifier";

export class Endurance extends ItemModifier {
  constructor() {
    super('endurance', {
      enduranceBonus: 2,
    }, 6, true);
  }
}

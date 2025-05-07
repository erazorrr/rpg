import {ItemModifier} from "../item-modifier";

export class GiantEndurance extends ItemModifier {
  constructor() {
    super('giant endurance', {
      enduranceBonus: 6,
    }, 15, true);
  }
}

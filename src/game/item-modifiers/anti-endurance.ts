import {ItemModifier} from "../item-modifier";

export class AntiEndurance extends ItemModifier {
  constructor() {
    super('breathlessness', {
      enduranceBonus: -2,
    }, -5, true);
  }
}

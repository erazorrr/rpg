import {ItemModifier} from "../item-modifier";

export class AntiEndurance extends ItemModifier {
  constructor() {
    super('breathlessness', {
      enduranceBonus: -2,
    }, -2, true);
  }
}

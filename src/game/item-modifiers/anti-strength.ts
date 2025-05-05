import {ItemModifier} from "../item-modifier";

export class AntiStrength extends ItemModifier {
  constructor() {
    super('weakness', {
      strengthBonus: -2,
    }, -3, true);
  }
}

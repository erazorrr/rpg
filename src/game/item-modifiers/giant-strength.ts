import {ItemModifier} from "../item-modifier";

export class GiantStrength extends ItemModifier {
  constructor() {
    super('giant strength', {
      strengthBonus: 6,
    }, 17, true);
  }
}

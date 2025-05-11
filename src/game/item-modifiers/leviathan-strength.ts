import {ItemModifier} from "../item-modifier";

export class LeviathanStrength extends ItemModifier {
  constructor() {
    super('leviathan strength', {
      strengthBonus: 10,
    }, 24, true);
  }
}

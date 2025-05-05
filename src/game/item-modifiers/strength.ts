import {ItemModifier} from "../item-modifier";

export class Strength extends ItemModifier {
  constructor() {
    super('strength', {
      strengthBonus: 2,
    }, 6, true);
  }
}

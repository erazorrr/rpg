import {ItemModifier} from "../item-modifier";

export class Dexterity extends ItemModifier {
  constructor() {
    super('dexterity', {
      dexterityBonus: 2,
    }, 2, true);
  }
}

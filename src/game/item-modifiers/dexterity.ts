import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class Dexterity extends ItemModifier {
  constructor() {
    super('dexterity', {
      dexterityBonus: 2,
    }, Math.round(2 * PRICE_PER_DEXTERITY), true);
  }
}

import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class GiantDexterity extends ItemModifier {
  constructor() {
    super('giant dexterity', {
      dexterityBonus: 6,
    }, Math.round(6 * PRICE_PER_DEXTERITY), true);
  }
}

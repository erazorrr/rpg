import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class AntiDexterity extends ItemModifier {
  constructor() {
    super('clumsiness', {
      dexterityBonus: -2,
    }, Math.round(0.75 * -2 * PRICE_PER_DEXTERITY), true);
  }
}

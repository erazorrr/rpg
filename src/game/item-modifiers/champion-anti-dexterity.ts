import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class ChampionAntiDexterity extends ItemModifier {
  constructor() {
    super('champion clumsiness', {
      dexterityBonus: -4,
    }, Math.round(0.75 * -4 * PRICE_PER_DEXTERITY), true);
  }
}

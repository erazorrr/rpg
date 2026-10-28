import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class ChampionDexterity extends ItemModifier {
  public static readonly saveId = "champion-dexterity";

  constructor() {
    super('champion dexterity', {
      dexterityBonus: 4,
    }, Math.round(4 * PRICE_PER_DEXTERITY), true);
  }
}

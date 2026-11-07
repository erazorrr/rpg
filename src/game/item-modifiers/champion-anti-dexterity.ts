import {ItemModifier} from "../item-modifier";
import {PRICE_PER_DEXTERITY} from "../prices";

export class ChampionAntiDexterity extends ItemModifier {
  public static readonly saveId = "champion-anti-dexterity";

  constructor() {
    super('torpor', {
      dexterityBonus: -4,
    }, Math.round(PRICE_PER_DEXTERITY * -4 * 0.5), true);
  }
}

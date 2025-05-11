import {ItemModifier} from "../item-modifier";

export class ChampionAntiDexterity extends ItemModifier {
  constructor() {
    super('champion clumsiness', {
      dexterityBonus: -4,
    }, -3, true);
  }
}

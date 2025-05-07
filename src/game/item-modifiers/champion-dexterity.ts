import {ItemModifier} from "../item-modifier";

export class ChampionDexterity extends ItemModifier {
  constructor() {
    super('champion dexterity', {
      dexterityBonus: 4,
    }, 5, true);
  }
}

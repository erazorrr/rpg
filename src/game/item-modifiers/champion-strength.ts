import {ItemModifier} from "../item-modifier";

export class ChampionStrength extends ItemModifier {
  constructor() {
    super('champion strength', {
      strengthBonus: 4,
    }, 9, true);
  }
}

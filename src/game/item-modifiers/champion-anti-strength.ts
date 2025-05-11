import {ItemModifier} from "../item-modifier";

export class ChampionAntiStrength extends ItemModifier {
  constructor() {
    super('champion weakness', {
      strengthBonus: -4,
    }, -3, true);
  }
}

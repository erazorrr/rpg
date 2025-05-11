import {ItemModifier} from "../item-modifier";

export class ChampionEndurance extends ItemModifier {
  constructor() {
    super('champion endurance', {
      enduranceBonus: 4,
    }, 10, true);
  }
}

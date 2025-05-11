import {ItemModifier} from "../item-modifier";

export class ChampionAntiEndurance extends ItemModifier {
  constructor() {
    super('champion breathlessness', {
      enduranceBonus: -4,
    }, -6, true);
  }
}

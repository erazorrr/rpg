import {ItemModifier} from "../item-modifier";

export class LeviathanEndurance extends ItemModifier {
  constructor() {
    super('leviathan endurance', {
      enduranceBonus: 10,
    }, 24, true);
  }
}

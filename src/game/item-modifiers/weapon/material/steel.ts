import {ItemModifier} from "../../../item-modifier";

export class SteelModifier extends ItemModifier {
  constructor() {
    super('Steel', {
      damageBonus: 2,
    }, 4);
  }
}

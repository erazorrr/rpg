import {ItemModifier} from "../../../item-modifier";

export class CopperModifier extends ItemModifier {
  constructor() {
    super('Copper', {
      damageBonus: -1,
    }, -1);
  }
}

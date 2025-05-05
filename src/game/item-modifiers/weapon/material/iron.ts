import {ItemModifier} from "../../../item-modifier";

export class IronModifier extends ItemModifier {
  constructor() {
    super('Iron', {
      damageBonus: 1,
    }, 1);
  }
}

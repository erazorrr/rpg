import {ItemModifier} from "../../../item-modifier";

export class IronArmorModifier extends ItemModifier {
  constructor() {
    super('Iron', {
      armor: 1,
    }, 1);
  }
}

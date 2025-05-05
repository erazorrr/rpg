import {ItemModifier} from "../../../item-modifier";

export class SteelArmorModifier extends ItemModifier {
  constructor() {
    super('Steel', {
      armor: 2,
    }, 4);
  }
}

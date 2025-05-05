import {ItemModifier} from "../../../item-modifier";

export class CopperArmorModifier extends ItemModifier {
  constructor() {
    super('Copper', {
      armor: -1,
    }, -1);
  }
}

import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_ARMOR} from "../../../prices";

export class CopperArmorModifier extends ItemModifier {
  constructor() {
    super('Copper', {
      armor: -1,
    }, Math.round(PRICE_PER_ARMOR * -1 * 0.75));
  }
}

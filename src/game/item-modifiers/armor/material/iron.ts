import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_ARMOR} from "../../../prices";

export class IronArmorModifier extends ItemModifier {
  constructor() {
    super('Iron', {
      armor: 1,
    }, Math.round(PRICE_PER_ARMOR));
  }
}

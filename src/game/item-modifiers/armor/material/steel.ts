import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_ARMOR} from "../../../prices";

export class SteelArmorModifier extends ItemModifier {
  constructor() {
    super('Steel', {
      armor: 2,
    }, Math.round(PRICE_PER_ARMOR * 2));
  }
}

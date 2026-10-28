import {ItemModifier} from "../../../item-modifier";
import {PRICE_PER_ARMOR} from "../../../prices";

export class IronArmorModifier extends ItemModifier {
  public static readonly saveId = "iron-armor";

  constructor() {
    super('Iron', {
      armor: 1,
    }, Math.round(PRICE_PER_ARMOR));
  }
}

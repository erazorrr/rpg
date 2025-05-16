import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class GiantHealth extends ItemModifier {
  constructor() {
    super('giant health', {
      maxHp: 15,
    }, Math.round(PRICE_PER_HP * 15), true);
  }
}

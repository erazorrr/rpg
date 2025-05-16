import {ItemModifier} from "../item-modifier";
import {PRICE_PER_HP} from "../prices";

export class AntiHealth extends ItemModifier {
  constructor() {
    super('disease', {
      maxHp: -5,
    }, Math.round(PRICE_PER_HP * -5 * 0.5), true);
  }
}

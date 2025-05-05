import {ItemModifier} from "../item-modifier";

export class Health extends ItemModifier {
  constructor() {
    super('health', {
      maxHp: 10,
    }, 5, true);
  }
}

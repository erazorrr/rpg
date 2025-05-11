import {ItemModifier} from "../item-modifier";

export class GiantHealth extends ItemModifier {
  constructor() {
    super('giant health', {
      maxHp: 15,
    }, 12, true);
  }
}

import {ItemModifier} from "../item-modifier";

export class GiantDexterity extends ItemModifier {
  constructor() {
    super('giant dexterity', {
      dexterityBonus: 6,
    }, 11, true);
  }
}

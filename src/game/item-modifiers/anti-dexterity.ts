import {ItemModifier} from "../item-modifier";

export class AntiDexterity extends ItemModifier {
  constructor() {
    super('clumsiness', {
      dexterityBonus: -2,
    }, -2, true);
  }
}

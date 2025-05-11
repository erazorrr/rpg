import {ItemModifier} from "../item-modifier";

export class AntiDexterity extends ItemModifier {
  constructor() {
    super('clumsiness', {
      dexterityBonus: -2,
    }, -1, true);
  }
}

import {ItemModifier} from "../item-modifier";

export class AntiHealth extends ItemModifier {
  constructor() {
    super('disease', {
      maxHp: -10,
    }, -4, true);
  }
}

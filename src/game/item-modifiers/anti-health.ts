import {ItemModifier} from "../item-modifier";

export class AntiHealth extends ItemModifier {
  constructor() {
    super('disease', {
      maxHp: -5,
    }, -4, true);
  }
}

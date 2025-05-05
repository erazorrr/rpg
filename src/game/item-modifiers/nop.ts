import {ItemModifier} from "../item-modifier";

export class NopModifier extends ItemModifier {
  constructor() {
    super('', {}, 0);
  }
}

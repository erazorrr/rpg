import {ItemModifier} from "../item-modifier";

export class NopModifier extends ItemModifier {
  public static readonly saveId = "none";

  constructor() {
    super('', {}, 0);
  }
}

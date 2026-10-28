import {MonsterModifier} from "../monster-modifier";

export class WisdomMonsterModifier extends MonsterModifier {
  public static readonly saveId = "wisdom";

  constructor() {
    super('Wise', {wisdom: 6}, 2, false);
  }
}

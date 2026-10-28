import {MonsterModifier} from "../monster-modifier";

export class StrengthMonsterModifier extends MonsterModifier {
  public static readonly saveId = "strength";

  constructor() {
    super('Strong', {strength: 6}, 2, false);
  }
}

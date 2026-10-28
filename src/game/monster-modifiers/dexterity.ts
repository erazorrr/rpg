import {MonsterModifier} from "../monster-modifier";

export class DexterityMonsterModifier extends MonsterModifier {
  public static readonly saveId = "dexterity";

  constructor() {
    super('Agile', {dexterity: 6}, 1.5, false);
  }
}

import {MonsterModifier} from "../monster-modifier";

export class DexterityMonsterModifier extends MonsterModifier {
  constructor() {
    super('Agile', {dexterity: 4}, 1.5, false);
  }
}

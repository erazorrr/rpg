import {MonsterModifier} from "../monster-modifier";

export class DexterityMonsterModifier extends MonsterModifier {
  constructor() {
    super('Agile', {dexterity: 6}, 1.5, false);
  }
}

import {MonsterModifier} from "../monster-modifier";

export class StrengthMonsterModifier extends MonsterModifier {
  constructor() {
    super('Strong', {strength: 4}, 2, false);
  }
}

import {MonsterModifier} from "../monster-modifier";

export class StrengthMonsterModifier extends MonsterModifier {
  constructor() {
    super('Strong', {strength: 6}, 2, false);
  }
}

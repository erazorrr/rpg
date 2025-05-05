import {MonsterModifier} from "../monster-modifier";

export class EnduranceMonsterModifier extends MonsterModifier {
  constructor() {
    super('Grunt', {endurance: 4}, 3, false);
  }
}

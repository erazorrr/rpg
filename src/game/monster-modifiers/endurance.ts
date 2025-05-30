import {MonsterModifier} from "../monster-modifier";

export class EnduranceMonsterModifier extends MonsterModifier {
  constructor() {
    super('Grunt', {endurance: 6}, 2.5, false);
  }
}

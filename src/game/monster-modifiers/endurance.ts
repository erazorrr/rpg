import {MonsterModifier} from "../monster-modifier";

export class EnduranceMonsterModifier extends MonsterModifier {
  public static readonly saveId = "endurance";

  constructor() {
    super('Grunt', {endurance: 6}, 2.5, false);
  }
}

import {MonsterModifier} from "../monster-modifier";

export class EnduranceMonsterModifier extends MonsterModifier {
  public static readonly saveId = "endurance";

  constructor() {
    super('Grunt', {enduranceMultiplier: 1.5}, 1.75, false);
  }
}

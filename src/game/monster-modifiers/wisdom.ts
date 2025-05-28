import {MonsterModifier} from "../monster-modifier";

export class WisdomMonsterModifier extends MonsterModifier {
  constructor() {
    super('Wise', {wisdom: 6}, 2, false);
  }
}

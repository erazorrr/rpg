import {MonsterModifier} from '../monster-modifier';

export class VampiricMonsterModifier extends MonsterModifier {
  public static readonly saveId = 'vampiric';

  constructor() {
    super('Vampiric', {lifeStealPercent: .5}, 2.5, false);
  }
}

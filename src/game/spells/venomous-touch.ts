import {Spell, SpellTarget} from '../spell';
import {PoisonedState} from '../states/poisoned.state';

export class VenomousTouchSpell extends Spell {
  public static readonly saveId = 'venomous-touch';
  public readonly keyBinding = 'V';

  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 4,
      damageBonus: 1,
      damageType: 'poison',
      range: 1,
      stateChance: 1,
      state: () => new PoisonedState(10),
    }, 1);
  }

  public getName(): string { return 'Venomous Touch'; }
  public getMPCost(): number { return 4; }
}

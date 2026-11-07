import {Spell, SpellTarget} from '../spell';
import {PoisonedState} from '../states/poisoned.state';

export class PurgePoisonSpell extends Spell {
  public static readonly saveId = 'purge-poison';
  public readonly keyBinding = 'p';

  constructor() {
    super(SpellTarget.Self, {
      removeState: {
        saveId: PoisonedState.saveId,
        name: 'Poisoned',
      },
    }, 1);
  }

  public getName(): string {
    return 'Purge Poison';
  }

  public getMPCost(): number {
    return 5;
  }
}

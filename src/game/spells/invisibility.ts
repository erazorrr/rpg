import {Spell, SpellTarget} from '../spell';
import {InvisibilityState} from '../states/invisibility.state';

export class InvisibilitySpell extends Spell {
  public static readonly saveId = 'invisibility';
  public readonly keyBinding = 'i';

  constructor() {
    super(SpellTarget.Self, {state: () => new InvisibilityState(10)}, 4);
  }

  public getName(): string { return 'Invisibility'; }
  public getMPCost(): number { return 20; }
}

import {Spell, SpellTarget} from "../spell";
import {FrozenState} from "../states/frozen.state";

export class FreezeSpell extends Spell {
  public static readonly saveId = "freeze";
  public readonly keyBinding = 'z';

  constructor() {
    super(SpellTarget.Monster, {
      stateChance: 0.8,
      state: () => new FrozenState(10),
    }, 1);
  }

  getName(): string {
    return "Freeze";
  }

  getMPCost(): number {
    return 5;
  }
}

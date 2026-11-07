import {Spell, SpellTarget} from "../spell";
import {StrengthState} from "../states/strength.state";

export class EmpowerSpell extends Spell {
  public static readonly saveId = "empower";
  public readonly keyBinding = 'E';

  constructor() {
    super(SpellTarget.Self, {
      state: () => new StrengthState(30, 8),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Empower Self";
  }
}

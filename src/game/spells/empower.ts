import {Spell, SpellTarget} from "../spell";
import {StrengthState} from "../states/strength.state";

export class EmpowerSpell extends Spell {
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

import {Spell, SpellTarget} from "../spell";
import {StrengthState} from "../states/strength.state";

export class EmpowerSpell extends Spell {
  constructor() {
    super(SpellTarget.Self, {
      state: () => new StrengthState(30, 8),
    });
  }

  getMPCost(): number {
    return 12;
  }

  getName(): string {
    return "Empower Self";
  }
}

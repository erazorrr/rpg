import {Spell, SpellTarget} from "../spell";
import {StrengthState} from "../states/strength.state";

export class EmpowerOtherSpell extends Spell {
  public static readonly saveId = "empower-other";
  public readonly keyBinding = 'e';

  constructor() {
    super(SpellTarget.Monster, {
      state: () => new StrengthState(30, 8),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Empower";
  }
}

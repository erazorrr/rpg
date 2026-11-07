import {Spell, SpellTarget} from "../spell";
import {ArmorState} from "../states/armor.state";

export class FortifySpell extends Spell {
  public static readonly saveId = "fortify";
  public readonly keyBinding = 'O';

  constructor() {
    super(SpellTarget.Self, {
      state: () => new ArmorState(30, 15),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Fortify Self";
  }
}

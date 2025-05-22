import {Spell, SpellTarget} from "../spell";
import {ArmorState} from "../states/armor.state";

export class FortifySpell extends Spell {
  constructor() {
    super(SpellTarget.Self, {
      state: () => new ArmorState(30, 15),
    });
  }

  getMPCost(): number {
    return 12;
  }

  getName(): string {
    return "Fortify Self";
  }
}

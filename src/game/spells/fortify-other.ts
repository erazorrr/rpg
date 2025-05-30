import {Spell, SpellTarget} from "../spell";
import {ArmorState} from "../states/armor.state";

export class FortifyOtherSpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      state: () => new ArmorState(30, 15),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Fortify";
  }
}

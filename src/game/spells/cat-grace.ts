import {Spell, SpellTarget} from "../spell";
import {DexterityState} from "../states/dexterity.state";

export class CatGraceSpell extends Spell {
  constructor() {
    super(SpellTarget.Self, {
      state: () => new DexterityState(30, 8),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Cat’s Grace";
  }
}

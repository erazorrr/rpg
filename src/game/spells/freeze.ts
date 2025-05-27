import {Spell, SpellTarget} from "../spell";
import {FrozenState} from "../states/frozen.state";

export class FreezeSpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      stateChance: 0.75,
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

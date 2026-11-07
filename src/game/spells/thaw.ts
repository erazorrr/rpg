import {Spell, SpellTarget} from "../spell";
import {FrozenState} from "../states/frozen.state";

export class ThawSpell extends Spell {
  public static readonly saveId = "thaw";
  public readonly keyBinding = 't';

  constructor() {
    super(SpellTarget.Self, {
      removeState: {
        saveId: FrozenState.saveId,
        name: "Frozen",
      },
    }, 1);
  }

  getName(): string {
    return "Thaw";
  }

  getMPCost(): number {
    return 5;
  }
}

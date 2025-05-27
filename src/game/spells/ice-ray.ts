import {Spell, SpellTarget} from "../spell";
import {FrozenState} from "../states/frozen.state";
import {Char} from "../../io/char";
import {BackgroundColor} from "../../io/background.color";
import {ForegroundColor} from "../../io/foreground.color";

export class IceRaySpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 8,
      damageBonus: 5,
      stateChance: 0.5,
      state: () => new FrozenState(10),
    }, 3);
  }

  getName(): string {
    return "Ice Ray";
  }

  getMPCost(): number {
    return 25;
  }

  getProjectile(): Char | null {
    return {
      char: '•',
      backgroundColor: BackgroundColor.Black,
      color: ForegroundColor.SkyBlue1,
    };
  }
}

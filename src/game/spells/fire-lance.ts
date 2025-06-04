import {Spell, SpellTarget} from "../spell";
import {BurningState} from "../states/burning.state";
import {Char} from "../../io/char";
import {BackgroundColor} from "../../io/background.color";
import {ForegroundColor} from "../../io/foreground.color";

export class FireLanceSpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 10,
      damageBonus: 6,
      stateChance: 0.5,
      state: () => new BurningState(10, 1),
    }, 3);
  }

  getName(): string {
    return "Fire Lance";
  }

  getMPCost(): number {
    return 10;
  }

  getProjectile(): Char | null {
    return {
      char: '•',
      backgroundColor: BackgroundColor.Black,
      color: ForegroundColor.LightGoldenrod3,
    };
  }
}

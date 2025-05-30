import {Spell, SpellTarget} from "../spell";
import {BurningState} from "../states/burning.state";
import {Char} from "../../io/char";
import {BackgroundColor} from "../../io/background.color";
import {ForegroundColor} from "../../io/foreground.color";

export class FireBoltSpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 7,
      damageBonus: 3,
      stateChance: 0.5,
      state: () => new BurningState(10, 1),
    }, 1);
  }

  getName(): string {
    return "Fire Bolt";
  }

  getMPCost(): number {
    return 5;
  }

  getProjectile(): Char | null {
    return {
      char: '•',
      backgroundColor: BackgroundColor.Black,
      color: ForegroundColor.LightGoldenrod3,
    };
  }
}

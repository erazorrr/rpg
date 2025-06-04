import {Spell, SpellTarget} from "../spell";
import {FrozenState} from "../states/frozen.state";
import {Char} from "../../io/char";
import {BackgroundColor} from "../../io/background.color";
import {ForegroundColor} from "../../io/foreground.color";

export class IceShardSpell extends Spell {
  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 6,
      damageBonus: 2,
      stateChance: 0.5,
      state: () => new FrozenState(10),
    }, 2);
  }

  getName(): string {
    return "Ice Shard";
  }

  getMPCost(): number {
    return 7;
  }

  getProjectile(): Char | null {
    return {
      char: '•',
      backgroundColor: BackgroundColor.Black,
      color: ForegroundColor.SkyBlue1,
    };
  }
}

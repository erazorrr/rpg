import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class LongSword extends Weapon {
  getChar(): Char {
    return {
      char: 'I',
      color: ForegroundColor.DarkBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 8,
    damageBonus: 2,
  };

  constructor(context: Context) {
    super(context, {...LongSword.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * LongSword.baseStats.damageRoll + PRICE_PER_DAMAGE * LongSword.baseStats.damageBonus));
  }

  getBaseName(): string {
    return "Long Sword";
  }
}

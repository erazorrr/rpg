import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class ShortSword extends Weapon {
  getChar(): Char {
    return {
      char: '/',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 6,
    damageBonus: 1,
  };

  constructor(context: Context) {
    super(context, {...ShortSword.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * ShortSword.baseStats.damageRoll + PRICE_PER_DAMAGE * ShortSword.baseStats.damageBonus));
  }

  getBaseName(): string {
    return "Short Sword";
  }
}

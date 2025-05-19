import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "src/io/char";
import {BackgroundColor} from "../../../io/background.color";
import {ForegroundColor} from "../../../io/foreground.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class HandAxe extends Weapon {
  getChar(): Char {
    return {
      char: 'p',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 5,
    damageBonus: 2,
  };

  constructor(context: Context) {
    super(context, {...HandAxe.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * HandAxe.baseStats.damageRoll + PRICE_PER_DAMAGE * HandAxe.baseStats.damageBonus));
  }

  getBaseName(): string {
    return "Hand Axe";
  }
}

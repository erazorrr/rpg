import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "src/io/char";
import {BackgroundColor} from "../../../io/background.color";
import {ForegroundColor} from "../../../io/foreground.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class GreatAxe extends Weapon {
  getChar(): Char {
    return {
      char: 'P',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 10,
    damageBonus: 1,
  };

  constructor(context: Context) {
    super(context, {...GreatAxe.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * GreatAxe.baseStats.damageRoll + PRICE_PER_DAMAGE * GreatAxe.baseStats.damageBonus));
  }

  getBaseName(): string {
    return "Great Axe";
  }
}

import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "src/io/char";
import {BackgroundColor} from "../../../io/background.color";
import {ForegroundColor} from "../../../io/foreground.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class Bow extends Weapon {
  getChar(): Char {
    return {
      char: ')',
      color: ForegroundColor.RosyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 3,
    damageBonus: 1,
  };

  constructor(context: Context) {
    super(context, {...Bow.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * Bow.baseStats.damageRoll + PRICE_PER_DAMAGE * Bow.baseStats.damageBonus), true);
  }

  getBaseName(): string {
    return "Bow";
  }
}

import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "src/io/char";
import {BackgroundColor} from "../../../io/background.color";
import {ForegroundColor} from "../../../io/foreground.color";
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from "../../prices";

export class Crossbow extends Weapon {
  getChar(): Char {
    return {
      char: '}',
      color: ForegroundColor.RosyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    damageRoll: 3,
    damageBonus: 2,
  };

  constructor(context: Context) {
    super(context, {...Crossbow.baseStats}, Math.round(PRICE_PER_DAMAGE_ROLL * Crossbow.baseStats.damageRoll + PRICE_PER_DAMAGE * Crossbow.baseStats.damageBonus), true);
  }

  getBaseName(): string {
    return "Crossbow";
  }
}

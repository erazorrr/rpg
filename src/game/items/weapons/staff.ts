import {Weapon} from "./weapon";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from "../../prices";

export class Staff extends Weapon {
  getChar(): Char {
    return {
      char: 'I',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    magicDiceBonus: 6,
    magicBonus: 3,
  };

  constructor(context: Context) {
    super(context, {...Staff.baseStats}, Math.round(PRICE_PER_MAGIC_DICE_BONUS * Staff.baseStats.magicDiceBonus + PRICE_PER_MAGIC_BONUS * Staff.baseStats.magicBonus));
  }

  getBaseName(): string {
    return "Staff";
  }
}

import {Weapon} from "./weapon";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from "../../prices";

export class Wand extends Weapon {
  getChar(): Char {
    return {
      char: 'i',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    magicRoll: 4,
    magicBonus: 2,
  };

  constructor(context: Context) {
    super(context, {...Wand.baseStats}, Math.round(PRICE_PER_MAGIC_DICE_BONUS * Wand.baseStats.magicRoll + PRICE_PER_MAGIC_BONUS * Wand.baseStats.magicBonus));
  }

  getBaseName(): string {
    return "Wand";
  }
}

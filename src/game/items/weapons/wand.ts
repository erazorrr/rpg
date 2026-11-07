import {Weapon} from "./weapon";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from "../../prices";

export class Wand extends Weapon {
  public static readonly saveId = "wand";
  getChar(): Char {
    return {
      char: 'i',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    magicRoll: 1,
    magicBonus: 2,
    basicDamageRoll: 2,
    basicDamageBonus: 1,
    basicDamageType: 'arcane' as const,
  };

  constructor(context: Context) {
    super(
      context,
      {...Wand.baseStats},
      Math.round(
        PRICE_PER_MAGIC_DICE_BONUS * Wand.baseStats.magicRoll +
        PRICE_PER_MAGIC_BONUS * Wand.baseStats.magicBonus +
        PRICE_PER_MAGIC_DICE_BONUS * Wand.baseStats.basicDamageRoll),
      true,
      true,
    );
  }

  getBaseName(): string {
    return "Apprentice Wand";
  }
}

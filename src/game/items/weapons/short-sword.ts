import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

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
    super(context, {...ShortSword.baseStats}, 4);
  }

  getBaseName(): string {
    return "Short Sword";
  }
}

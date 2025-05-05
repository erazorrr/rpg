import {Weapon} from "./weapon";
import {Context} from "../../context";
import {Char} from "src/io/char";
import {BackgroundColor} from "../../../io/background.color";
import {ForegroundColor} from "../../../io/foreground.color";

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
    super(context, {...GreatAxe.baseStats}, 8);
  }

  getBaseName(): string {
    return "Great Axe";
  }
}

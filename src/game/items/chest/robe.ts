import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {Chest} from "./chest";
import {PRICE_PER_ARMOR} from "../../prices";

export class Robe extends Chest {
  getChar(): Char {
    return {
      char: 'U',
      color: ForegroundColor.Grey35,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 1,
  };

  constructor(context: Context) {
    super(context, {...Robe.baseStats}, Math.round(PRICE_PER_ARMOR * Robe.baseStats.armor));
  }

  getBaseName(): string {
    return "Robe";
  }
}

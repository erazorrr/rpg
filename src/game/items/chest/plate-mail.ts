import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {Chest} from "./chest";
import {PRICE_PER_ARMOR} from "../../prices";

export class PlateMail extends Chest {
  getChar(): Char {
    return {
      char: 'U',
      color: ForegroundColor.DarkBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 7,
  };

  constructor(context: Context) {
    super(context, {...PlateMail.baseStats}, Math.round(PRICE_PER_ARMOR * PlateMail.baseStats.armor));
  }

  getBaseName(): string {
    return "Plate Mail";
  }
}

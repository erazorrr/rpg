import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {Chest} from "./chest";

export class ChainMail extends Chest {
  getChar(): Char {
    return {
      char: 'U',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 4,
  };

  constructor(context: Context) {
    super(context, {...ChainMail.baseStats}, 7);
  }

  getBaseName(): string {
    return "Chain Mail";
  }
}

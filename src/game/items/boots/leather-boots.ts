import {Boots} from "./boots";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";

export class LeatherBoots extends Boots {
  getChar(): Char {
    return {
      char: 'J',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 1,
  };

  constructor(context: Context) {
    super(context, {...LeatherBoots.baseStats}, 4);
  }

  getBaseName(): string {
    return "Leather boots";
  }
}

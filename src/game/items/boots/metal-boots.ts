import {Boots} from "./boots";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";

export class MetalBoots extends Boots {
  getChar(): Char {
    return {
      char: 'J',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 3,
  };

  constructor(context: Context) {
    super(context, {...MetalBoots.baseStats}, 7);
  }

  getBaseName(): string {
    return "Boots";
  }
}

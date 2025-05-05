import {Gauntlets} from "./gauntlets";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";

export class MetalGauntlets extends Gauntlets {
  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 2,
  };

  constructor(context: Context) {
    super(context, {...MetalGauntlets.baseStats}, 6);
  }

  getBaseName(): string {
    return "Gauntlets";
  }
}

import {Gauntlets} from "./gauntlets";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";

export class LeatherGauntlets extends Gauntlets {
  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 1,
  };

  constructor(context: Context) {
    super(context, {...LeatherGauntlets.baseStats}, 2);
  }

  getBaseName(): string {
    return "Leather gauntlets";
  }
}

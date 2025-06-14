import {Gauntlets} from "./gauntlets";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_ARMOR} from "../../prices";

export class PlateGauntlets extends Gauntlets {
  getChar(): Char {
    return {
      char: 'u',
      color: ForegroundColor.DarkBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 3,
  };

  constructor(context: Context) {
    super(context, {...PlateGauntlets.baseStats}, Math.round(PRICE_PER_ARMOR * PlateGauntlets.baseStats.armor));
  }

  getBaseName(): string {
    return "Gauntlets";
  }
}

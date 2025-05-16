import {Boots} from "./boots";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_ARMOR} from "../../prices";

export class PlateBoots extends Boots {
  getChar(): Char {
    return {
      char: 'J',
      color: ForegroundColor.DarkBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 5,
  };

  constructor(context: Context) {
    super(context, {...PlateBoots.baseStats}, Math.round(PRICE_PER_ARMOR * PlateBoots.baseStats.armor));
  }

  getBaseName(): string {
    return "Plate Boots";
  }
}

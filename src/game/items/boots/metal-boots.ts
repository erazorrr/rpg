import {Boots} from "./boots";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_ARMOR} from "../../prices";

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
    super(context, {...MetalBoots.baseStats}, Math.round(PRICE_PER_ARMOR * MetalBoots.baseStats.armor));
  }

  getBaseName(): string {
    return "Boots";
  }
}

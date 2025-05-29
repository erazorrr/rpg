import {Gauntlets} from "./gauntlets";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";
import {PRICE_PER_ARMOR} from "../../prices";

export class MetalGauntlets extends Gauntlets {
  getChar(): Char {
    return {
      char: 'u',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 2,
  };

  constructor(context: Context) {
    super(context, {...MetalGauntlets.baseStats}, Math.round(PRICE_PER_ARMOR * MetalGauntlets.baseStats.armor));
  }

  getBaseName(): string {
    return "Gauntlets";
  }
}

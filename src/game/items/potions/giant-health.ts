import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class GiantHealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 75,
  };

  constructor(context: Context) {
    super(context, {...GiantHealthPotion.baseStats}, 18);
  }

  getBaseName(): string {
    return "Giant Health Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.HotPink,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

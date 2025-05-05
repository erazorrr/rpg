import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class SmallHealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 10,
  };

  constructor(context: Context) {
    super(context, {...SmallHealthPotion.baseStats}, 1);
  }

  getBaseName(): string {
    return "Small Health Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.Red,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

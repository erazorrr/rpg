import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class LargeHealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 30,
  };

  constructor(context: Context) {
    super(context, {...LargeHealthPotion.baseStats}, 8);
  }

  getBaseName(): string {
    return "Large Health Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Pink1,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

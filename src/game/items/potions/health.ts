import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class HealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 15,
  };

  constructor(context: Context) {
    super(context, {...HealthPotion.baseStats}, 4);
  }

  getBaseName(): string {
    return "Health Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Red,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

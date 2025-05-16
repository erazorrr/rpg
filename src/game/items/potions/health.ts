import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_HP_POINT} from "../../prices";

export class HealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 15,
  };

  constructor(context: Context) {
    super(context, {...HealthPotion.baseStats}, Math.round(PRICE_PER_HP_POINT * HealthPotion.baseStats.consumableHpReplenish));
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

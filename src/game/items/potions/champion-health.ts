import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_HP_POINT} from "../../prices";

export class ChampionHealthPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableHpReplenish: 50,
  };

  constructor(context: Context) {
    super(context, {...ChampionHealthPotion.baseStats}, Math.round(PRICE_PER_HP_POINT * ChampionHealthPotion.baseStats.consumableHpReplenish));
  }

  getBaseName(): string {
    return "Champion Health Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Pink3,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_MANA_POINT} from "../../prices";

export class SmallManaPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableMpReplenish: 30,
  };

  constructor(context: Context) {
    super(context, {...SmallManaPotion.baseStats}, Math.round(PRICE_PER_MANA_POINT * SmallManaPotion.baseStats.consumableMpReplenish));
  }

  getBaseName(): string {
    return "Small Mana Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

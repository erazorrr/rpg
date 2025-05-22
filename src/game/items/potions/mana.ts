import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_MANA_POINT} from "../../prices";

export class ManaPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableMpReplenish: 22,
  };

  constructor(context: Context) {
    super(context, {...ManaPotion.baseStats}, Math.round(PRICE_PER_MANA_POINT * ManaPotion.baseStats.consumableMpReplenish));
  }

  getBaseName(): string {
    return "Mana Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

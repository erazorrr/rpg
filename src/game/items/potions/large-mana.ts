import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_MANA_POINT} from "../../prices";

export class LargeManaPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableMpReplenish: 45,
  };

  constructor(context: Context) {
    super(context, {...LargeManaPotion.baseStats}, Math.round(PRICE_PER_MANA_POINT * LargeManaPotion.baseStats.consumableMpReplenish));
  }

  getBaseName(): string {
    return "Large Mana Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.LightSkyBlue1,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

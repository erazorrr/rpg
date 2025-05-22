import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_MANA_POINT} from "../../prices";

export class GiantManaPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableMpReplenish: 112,
  };

  constructor(context: Context) {
    super(context, {...GiantManaPotion.baseStats}, Math.round(PRICE_PER_MANA_POINT * GiantManaPotion.baseStats.consumableMpReplenish));
  }

  getBaseName(): string {
    return "Giant Mana Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Purple,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

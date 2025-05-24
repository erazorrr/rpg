import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {PRICE_PER_MANA_POINT} from "../../prices";

export class ChampionManaPotion extends Potion {
  private static baseStats: ItemStats = {
    consumableMpReplenish: 75,
  };

  constructor(context: Context) {
    super(context, {...ChampionManaPotion.baseStats}, Math.round(PRICE_PER_MANA_POINT * ChampionManaPotion.baseStats.consumableMpReplenish));
  }

  getBaseName(): string {
    return "Champion Mana Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.DarkBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }

}

import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {ArmorState} from "../../states/armor.state";

export class ChampionArmorPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new ArmorState(50, 20)}, 8);
  }

  getBaseName(): string {
    return "Champion Armor Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

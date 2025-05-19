import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {ArmorState} from "../../states/armor.state";

export class ArmorPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new ArmorState(30, 10)}, 4);
  }

  getBaseName(): string {
    return "Armor Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.SteelBlue,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

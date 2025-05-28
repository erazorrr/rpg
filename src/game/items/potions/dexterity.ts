import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {DexterityState} from "../../states/dexterity.state";

export class DexterityPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new DexterityState(30, 6)}, 4);
  }

  getBaseName(): string {
    return "Agility Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.Green,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

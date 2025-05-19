import {Potion} from "./potion";
import {Context} from "../../context";
import {StrengthState} from "../../states/strength.state";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class StrengthPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new StrengthState(30)}, 4);
  }

  getBaseName(): string {
    return "Strength Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

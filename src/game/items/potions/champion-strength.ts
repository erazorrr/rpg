import {Potion} from "./potion";
import {Context} from "../../context";
import {StrengthState} from "../../states/strength.state";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class ChampionStrengthPotion extends Potion {
  public static readonly saveId = "champion-strength-potion";
  public constructor(context: Context) {
    super(context, {consumableState: new StrengthState(50, 12)}, 8);
  }

  getBaseName(): string {
    return "Champion Strength Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

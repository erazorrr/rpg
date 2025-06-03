import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {WisdomState} from "../../states/wisdom.state";

export class WisdomPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new WisdomState(30, 6)}, 4);
  }

  getBaseName(): string {
    return "Wisdom Potion";
  }

  getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {WisdomState} from "../../states/wisdom.state";

export class ChampionWisdomPotion extends Potion {
  public constructor(context: Context) {
    super(context, {consumableState: new WisdomState(50, 12)}, 8);
  }

  getBaseName(): string {
    return "Champion wisdom potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

import {Potion} from "./potion";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {DexterityState} from "../../states/dexterity.state";

export class ChampionDexterityPotion extends Potion {
  public static readonly saveId = "champion-dexterity-potion";
  public constructor(context: Context) {
    super(context, {consumableState: new DexterityState(50, 12)}, 8);
  }

  getBaseName(): string {
    return "Champion Agility Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Green,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

import {Potion} from "./potion";
import {Char} from "../../../io/char";
import {Context} from "../../context";
import {ItemStats} from "../../item";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {FrozenState} from "../../states/frozen.state";

export class ThawPotion extends Potion {
  public static readonly saveId = "thaw-potion";
  private static baseStats: ItemStats = {
    consumableStateRemoval: {
      saveId: FrozenState.saveId,
      name: "Frozen",
    },
  };

  constructor(context: Context) {
    super(context, {...ThawPotion.baseStats}, 4);
  }

  getBaseName(): string {
    return "Thaw Potion";
  }

  getChar(): Char {
    return {
      char: 'Q',
      color: ForegroundColor.Cyan1,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

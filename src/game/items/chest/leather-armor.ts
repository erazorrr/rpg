import {Chest} from "./chest";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";
import {Context} from "../../context";

export class LeatherArmor extends Chest {
  getChar(): Char {
    return {
      char: 'U',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    };
  }

  private static baseStats = {
    armor: 2,
  };

  constructor(context: Context) {
    super(context, {...LeatherArmor.baseStats}, 4);
  }

  getBaseName(): string {
    return "Leather Armor";
  }
}

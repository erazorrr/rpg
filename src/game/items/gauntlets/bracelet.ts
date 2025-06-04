import {Item, ItemType} from "../../item";
import {Context} from "../../context";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {BackgroundColor} from "../../../io/background.color";

export class Bracelet extends Item {
  constructor(context: Context) {
    super(context, ItemType.Gauntlets, {...Bracelet.baseStats}, 1);
  }

  private static baseStats = {};

  getBaseName(): string {
    return "Bracelet";
  }

  getChar(): Char {
    return {
      char: 'c',
      color: ForegroundColor.DarkGreen,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

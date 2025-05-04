import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class WaterTile extends Tile {
  getChar(): Char {
    return {
      char: '~',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Blue3a,
    };
  }

  isNavigable(): boolean {
    return false;
  }
}

import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class WaterTile extends Tile {
  getBaseChar(): Char {
    return {
      char: Math.random() < 0.01 ? ' ' : '~',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Blue3a,
    };
  }

  isNavigable(): boolean {
    return false;
  }
}

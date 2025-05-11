import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class ShallowWaterTile extends Tile {
  getBaseChar(): Char {
    return {
      char: ' ',
      color: ForegroundColor.DarkBlue,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Blue,
    };
  }

  isNavigable(): boolean {
    return true;
  }
}

import { Char } from "src/io/char";
import {Tile} from "./abstract.tile";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class StairsUpTile extends Tile {
  getChar(): Char {
    return {
      char: '<',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Grey11,
    };
  }
  isNavigable(): boolean {
    return true;
  }
}

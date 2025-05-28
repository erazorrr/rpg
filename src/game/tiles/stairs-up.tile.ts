import { Char } from "src/io/char";
import {Tile} from "./abstract.tile";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class StairsUpTile extends Tile {
  getBaseChar(): Char {
    return {
      char: '<',
      color: ForegroundColor.Grey50,
      backgroundColor: BackgroundColor.Aqua,
    };
  }
  isNavigable(): boolean {
    return true;
  }
}

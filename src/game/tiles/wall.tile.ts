import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class WallTile extends Tile {
  getChar(): Char {
    return {
      char: ' ',
      color: ForegroundColor.Pink1,
      backgroundColor: BackgroundColor.Black,
    };
  }

  isNavigable(): boolean {
    return false;
  }
}

import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class TreeTile extends Tile {
  getChar(): Char {
    return {
      char: 'T',
      color: ForegroundColor.Orange4a,
      backgroundColor: BackgroundColor.SpringGreen2a,
    };
  }

  isNavigable(): boolean {
    return false;
  }
}

import { Char } from "src/io/char";
import {Tile} from "./abstract.tile";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class ExitTile extends Tile {
  getBaseChar(): Char {
    return {
      char: 'X',
      color: ForegroundColor.Grey50,
      backgroundColor: BackgroundColor.Green,
    };
  }
  isNavigable(): boolean {
    return true;
  }
}

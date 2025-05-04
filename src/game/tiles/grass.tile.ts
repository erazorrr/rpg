import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class GrassTile extends Tile {
  private char: string = Math.random() > 0.85 ? ',' : ' ';
  private bgColor: BackgroundColor = BackgroundColor.SpringGreen2a;
  private color: ForegroundColor = Math.random() > 0.5 ? ForegroundColor.SpringGreen2b : ForegroundColor.DarkGreen;

  getChar(): Char {
    return {
      char: this.char,
      color: this.color,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : this.bgColor,
    };
  }

  isNavigable(): boolean {
    return true;
  }
}

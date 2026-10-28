import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";

export class GrassTile extends Tile {
  public static readonly saveId = "grass";

  private bgColor: BackgroundColor = BackgroundColor.SpringGreen2a;

  getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const x = position?.x ?? 0;
    const y = position?.y ?? 0;
    const coarseFrame = Math.floor((frame?.frame ?? 0) / 8);
    const subset = (x * 17 + y * 31) % 13;
    const phase = (x * 7 + y * 13 + coarseFrame) % 3;
    const chars = [' ', ',', "'"];
    const char = subset === 0 ? chars[phase] : subset === 7 ? ',' : ' ';
    return {
      char,
      color: (x + y) % 2 === 0 ? ForegroundColor.SpringGreen2b : ForegroundColor.DarkGreen,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : this.bgColor,
    };
  }

  isNavigable(): boolean {
    return true;
  }
}

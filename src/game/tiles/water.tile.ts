import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";

export class WaterTile extends Tile {
  public static readonly saveId = "water";

  getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const coarseFrame = Math.floor((frame?.frame ?? 0) / 2);
    const phase = ((position?.x ?? 0) * 17 + (position?.y ?? 0) * 31 + coarseFrame) % 5;
    return {
      char: phase === 0 ? '-' : '~',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Blue3a,
    };
  }

  isNavigable(): boolean {
    return false;
  }
}

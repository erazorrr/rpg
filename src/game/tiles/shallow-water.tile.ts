import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";

export class ShallowWaterTile extends Tile {
  public static readonly saveId = "shallow-water";

  getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const coarseFrame = Math.floor((frame?.frame ?? 0) / 4);
    const phase = ((position?.x ?? 0) * 11 + (position?.y ?? 0) * 23 + coarseFrame) % 7;
    return {
      char: phase === 0 ? '~' : ' ',
      color: ForegroundColor.DarkBlue,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Blue,
    };
  }

  isNavigable(): boolean {
    return true;
  }
}

import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
 import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";
import {TileLight} from "./abstract.tile";

export class TorchTile extends Tile {
  public static readonly saveId = "torch";

  getBaseChar(): Char {
    return {
      char: ' ',
      color: ForegroundColor.Pink1,
      backgroundColor: this.isBloody ? BackgroundColor.Red : BackgroundColor.Gold1,
    };
  }

  isNavigable(): boolean {
    return true;
  }

  public getLight(frame?: AnimationFrame, position?: Position): TileLight {
    const phase = ((position?.x ?? 0) * 17 + (position?.y ?? 0) * 31 + Math.floor((frame?.frame ?? 0) / 3)) % 2;
    return {
      radius: 6,
      innerRadius: 2 + phase,
      innerColor: BackgroundColor.LightGoldenrod3,
      outerColor: BackgroundColor.Orange4b,
      bloodyInnerColor: BackgroundColor.Red3a,
      bloodyOuterColor: BackgroundColor.Red3a,
    };
  }
}

import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class TorchTile extends Tile {
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
}

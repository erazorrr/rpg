import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export abstract class Tile {
  abstract getBaseChar(): Char;
  abstract isNavigable(): boolean;

  protected isBloody = false;
  setBloody(bloody: boolean) {
    this.isBloody = bloody;
  }

  protected explored = false;
  setExplored(explored: boolean) {
    this.explored = explored;
  }

  isExplored(): boolean {
    return this.explored;
  }

  getChar(): Char {
    if (this.explored) {
      return this.getBaseChar();
    } else {
      return {
        char: ' ',
        color: ForegroundColor.Pink1,
        backgroundColor: BackgroundColor.Black,
      };
    }
  }
}

import {Char} from "../../io/char";

export abstract class Tile {
  abstract getChar(): Char;
  abstract isNavigable(): boolean;

  protected isBloody = false;
  setBloody(bloody: boolean) {
    this.isBloody = bloody;
  }
}

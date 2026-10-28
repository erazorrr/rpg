import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Saveable, TileSave} from "../save-data";
import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";

export abstract class Tile implements Saveable<TileSave> {
  public get saveId(): string {
    return (this.constructor as typeof Tile & {readonly saveId: string}).saveId;
  }

  abstract getBaseChar(frame?: AnimationFrame, position?: Position): Char;
  abstract isNavigable(): boolean;

  protected isBloody = false;
  setBloody(bloody: boolean) {
    this.isBloody = bloody;
  }

  getIsBloody(): boolean {
    return this.isBloody;
  }

  protected explored = false;
  setExplored(explored: boolean) {
    this.explored = explored;
  }

  isExplored(): boolean {
    return this.explored;
  }

  getChar(frame?: AnimationFrame, position?: Position): Char {
    if (this.explored) {
      return this.getBaseChar(frame, position);
    } else {
      return {
        char: ' ',
        color: ForegroundColor.Pink1,
        backgroundColor: BackgroundColor.Black,
      };
    }
  }

  public toSaveData(): TileSave {
    return {
      kind: this.saveId,
      explored: this.explored,
      bloody: this.isBloody,
    };
  }
}

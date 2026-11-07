import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class SearingGrateTile extends Tile {
  public static readonly saveId = 'searing-grate';

  public getBaseChar(): Char {
    return {
      char: '=',
      color: ForegroundColor.Yellow1,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Red,
    };
  }

  public isNavigable(): boolean { return true; }
}

import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class FrostGeodeTile extends Tile {
  public static readonly saveId = 'frost-geode';

  public getBaseChar(): Char {
    return {
      char: 'O',
      color: ForegroundColor.LightCyan1,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.NavyBlue,
    };
  }

  public isNavigable(): boolean { return false; }
}

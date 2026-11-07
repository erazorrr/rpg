import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class SporePodTile extends Tile {
  public static readonly saveId = 'spore-pod';

  public getBaseChar(): Char {
    return {
      char: 'o',
      color: ForegroundColor.PaleGreen3a,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return true; }
}

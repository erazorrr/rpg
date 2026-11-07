import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class AshUrnTile extends Tile {
  public static readonly saveId = 'ash-urn';

  public getBaseChar(): Char {
    return {
      char: 'u',
      color: ForegroundColor.Grey69,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }
}

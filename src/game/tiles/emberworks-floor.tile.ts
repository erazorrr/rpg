import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';

export class EmberworksFloorTile extends Tile {
  public static readonly saveId = 'emberworks-floor';

  public getBaseChar(_frame?: never, position?: Position): Char {
    const rivet = ((position?.x ?? 0) * 7 + (position?.y ?? 0) * 11) % 9 === 0;
    return {
      char: rivet ? '=' : ' ',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return true; }
}

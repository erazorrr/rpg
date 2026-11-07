import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';

export class BareEarthTile extends Tile {
  public static readonly saveId = 'bare-earth';

  public getBaseChar(_frame?: never, position?: Position): Char {
    const x = position?.x ?? 0;
    const y = position?.y ?? 0;
    const pattern = (x * 17 + y * 7) % 13;
    return {
      char: pattern === 0 ? ':' : pattern === 5 ? '.' : pattern === 9 ? ',' : ' ',
      color: (x + y) % 2 === 0 ? ForegroundColor.Wheat4 : ForegroundColor.DarkGoldenrod,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Wheat4,
    };
  }

  public isNavigable(): boolean {
    return true;
  }
}

import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';

export class OldRoadTile extends Tile {
  public static readonly saveId = 'old-road';

  getBaseChar(_frame?: never, position?: Position): Char {
    const pattern = ((position?.x ?? 0) * 7 + (position?.y ?? 0) * 11) % 9;
    return {
      char: pattern === 0 ? ':' : pattern === 4 ? ',' : ' ',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.DarkOliveGreen3a,
    };
  }

  isNavigable(): boolean {
    return true;
  }
}

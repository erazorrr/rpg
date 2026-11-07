import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';
export class FlagstoneFloorTile extends Tile {
  static readonly saveId = 'flagstone-floor';
  getBaseChar(_frame?: never, position?: Position): Char { const seam = ((position?.x ?? 0) + 2 * (position?.y ?? 0)) % 11 === 0; return {char: seam ? '.' : ' ', color: ForegroundColor.Grey53, backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey23}; }
  isNavigable(): boolean { return true; }
}

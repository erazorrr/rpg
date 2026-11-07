import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';
export class CaveFloorTile extends Tile {
  static readonly saveId = 'cave-floor';
  getBaseChar(_frame?: never, position?: Position): Char { const n = ((position?.x ?? 0) * 13 + (position?.y ?? 0) * 19) % 19; return {char: n === 0 ? ':' : n === 8 ? '.' : ' ', color: ForegroundColor.Grey37, backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19}; }
  isNavigable(): boolean { return true; }
}

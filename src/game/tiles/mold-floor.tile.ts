import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {AnimationFrame} from '../animation';
import {Position} from '../../io/position';
import {Tile} from './abstract.tile';
export class MoldFloorTile extends Tile {
  static readonly saveId = 'mold-floor';
  getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const n = ((position?.x ?? 0) * 17 + (position?.y ?? 0) * 31 + Math.floor((frame?.frame ?? 0) / 12)) % 17;
    return {char: n === 0 ? "'" : n === 7 ? ',' : ' ', color: ForegroundColor.DarkSeaGreen, backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19};
  }
  isNavigable(): boolean { return true; }
}

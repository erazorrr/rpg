import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class WoodenWallTile extends Tile {
  public static readonly saveId = 'wooden-wall';

  public getBaseChar(): Char {
    return {
      char: '#',
      color: ForegroundColor.Wheat4,
      backgroundColor: BackgroundColor.Orange4a,
    };
  }

  public isNavigable(): boolean {
    return false;
  }

  public getBumpMessages(): string[] {
    return ['Weathered planks have been fitted into the wall of a small shack.'];
  }
}

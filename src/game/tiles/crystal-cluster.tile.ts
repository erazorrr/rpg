import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class CrystalClusterTile extends Tile {
  public static readonly saveId = 'crystal-cluster';

  public getBaseChar(): Char {
    return {
      char: '*',
      color: ForegroundColor.LightCyan1,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }
}

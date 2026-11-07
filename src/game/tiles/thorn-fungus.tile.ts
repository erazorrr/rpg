import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Tile} from './abstract.tile';

export class ThornFungusTile extends Tile {
  public static readonly saveId = 'thorn-fungus';

  public getBaseChar(): Char {
    return {
      char: 'v',
      color: ForegroundColor.GreenYellow,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return true; }
}

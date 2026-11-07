import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

export class PressureValveTile extends Tile {
  public static readonly saveId = 'pressure-valve';

  constructor(private spent = false) {
    super();
  }

  public isSpent(): boolean { return this.spent; }
  public activate(): void { this.spent = true; }

  public getBaseChar(): Char {
    return {
      char: this.spent ? 'o' : '0',
      color: this.spent ? ForegroundColor.Grey53 : ForegroundColor.Orange1,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), pressureValveSpent: this.spent};
  }
}

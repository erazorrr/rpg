import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {AnimationFrame} from '../animation';
import {Tile, TileLight} from './abstract.tile';

export class DeepEmberTile extends Tile {
  public static readonly saveId = 'deep-ember';

  public getBaseChar(frame?: AnimationFrame): Char {
    const color = (frame?.frame ?? 0) % 2 === 0 ? ForegroundColor.Gold1 : ForegroundColor.Orange1;
    return {char: '*', color, backgroundColor: BackgroundColor.DarkRed1};
  }

  public isNavigable(): boolean {
    return true;
  }

  public getLight(frame?: AnimationFrame, position?: Position): TileLight {
    void frame;
    void position;
    return {
      radius: 6,
      innerRadius: 2,
      innerColor: BackgroundColor.DarkRed1,
      outerColor: BackgroundColor.Orange4a,
      bloodyInnerColor: BackgroundColor.DarkRed2,
      bloodyOuterColor: BackgroundColor.DarkRed1,
    };
  }
}

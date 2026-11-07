import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_ARMOR} from '../../prices';
import {Boots} from './boots';

export class TrailBoots extends Boots {
  public static readonly saveId = 'trail-boots';
  private static readonly baseStats = {armor: 1};

  public constructor(context: Context) {
    super(context, {...TrailBoots.baseStats}, Math.round(PRICE_PER_ARMOR * TrailBoots.baseStats.armor));
  }

  public getBaseName(): string { return 'Trail Boots'; }
  public getChar(): Char {
    return {char: 'J', color: ForegroundColor.DarkGoldenrod, backgroundColor: BackgroundColor.Black};
  }
}

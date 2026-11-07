import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_ARMOR} from '../../prices';
import {Chest} from './chest';

export class PaddedCoat extends Chest {
  public static readonly saveId = 'padded-coat';
  private static readonly baseStats = {armor: 2};

  public constructor(context: Context) {
    super(context, {...PaddedCoat.baseStats}, Math.round(PRICE_PER_ARMOR * PaddedCoat.baseStats.armor));
  }

  public getBaseName(): string { return 'Padded Coat'; }
  public getChar(): Char {
    return {char: 'U', color: ForegroundColor.Wheat4, backgroundColor: BackgroundColor.Black};
  }
}

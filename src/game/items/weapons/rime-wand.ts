import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from '../../prices';
import {Weapon} from './weapon';

export class RimeWand extends Weapon {
  public static readonly saveId = 'rime-wand';
  private static readonly baseStats = {
    magicRoll: 3,
    magicBonus: 0,
    basicDamageRoll: 2,
    basicDamageBonus: 1,
    basicDamageType: 'frost' as const,
  };

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_MAGIC_DICE_BONUS * RimeWand.baseStats.magicRoll +
      PRICE_PER_MAGIC_BONUS * RimeWand.baseStats.magicBonus +
      PRICE_PER_MAGIC_DICE_BONUS * RimeWand.baseStats.basicDamageRoll +
      PRICE_PER_MAGIC_BONUS * RimeWand.baseStats.basicDamageBonus,
    );
    super(context, {...RimeWand.baseStats}, cost, true, true);
  }

  public getBaseName(): string { return 'Rime Wand'; }
  public getChar(): Char {
    return {char: 'i', color: ForegroundColor.Cyan1, backgroundColor: BackgroundColor.Black};
  }
}

import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from '../../prices';
import {Weapon} from './weapon';

export class CinderWand extends Weapon {
  public static readonly saveId = 'cinder-wand';
  private static readonly baseStats = {
    magicRoll: 1,
    magicBonus: 2,
    basicDamageRoll: 2,
    basicDamageBonus: 1,
    basicDamageType: 'fire' as const,
  };

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_MAGIC_DICE_BONUS * CinderWand.baseStats.magicRoll +
      PRICE_PER_MAGIC_BONUS * CinderWand.baseStats.magicBonus +
      PRICE_PER_MAGIC_DICE_BONUS * CinderWand.baseStats.basicDamageRoll +
      PRICE_PER_MAGIC_BONUS * CinderWand.baseStats.basicDamageBonus,
    );
    super(context, {...CinderWand.baseStats}, cost, true, true);
  }

  public getBaseName(): string { return 'Cinder Wand'; }
  public getChar(): Char {
    return {char: 'i', color: ForegroundColor.Orange1, backgroundColor: BackgroundColor.Black};
  }
}

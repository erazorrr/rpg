import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from '../../prices';
import {Weapon} from './weapon';

export class Sling extends Weapon {
  public static readonly saveId = 'sling';
  private static readonly baseStats = {damageRoll: 1, damageBonus: 2};

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_DAMAGE_ROLL * Sling.baseStats.damageRoll +
      PRICE_PER_DAMAGE * Sling.baseStats.damageBonus,
    );
    super(context, {...Sling.baseStats}, cost, true);
  }

  public getBaseName(): string { return 'Sling'; }
  public getChar(): Char {
    return {char: '(', color: ForegroundColor.RosyBrown, backgroundColor: BackgroundColor.Black};
  }
}

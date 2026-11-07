import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from '../../prices';
import {Weapon} from './weapon';

export class Arbalest extends Weapon {
  public static readonly saveId = 'arbalest';
  private static readonly baseStats = {damageRoll: 5, damageBonus: 1};

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_DAMAGE_ROLL * Arbalest.baseStats.damageRoll +
      PRICE_PER_DAMAGE * Arbalest.baseStats.damageBonus,
    );
    super(context, {...Arbalest.baseStats}, cost, true);
  }

  public getBaseName(): string { return 'Arbalest'; }
  public getChar(): Char {
    return {char: '{', color: ForegroundColor.LightSteelBlue, backgroundColor: BackgroundColor.Black};
  }
}

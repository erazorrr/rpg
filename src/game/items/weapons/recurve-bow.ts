import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from '../../prices';
import {Weapon} from './weapon';

export class RecurveBow extends Weapon {
  public static readonly saveId = 'recurve-bow';
  private static readonly baseStats = {damageRoll: 5, damageBonus: 0};

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_DAMAGE_ROLL * RecurveBow.baseStats.damageRoll +
      PRICE_PER_DAMAGE * RecurveBow.baseStats.damageBonus,
    );
    super(context, {...RecurveBow.baseStats}, cost, true);
  }

  public getBaseName(): string { return 'Recurve Bow'; }
  public getChar(): Char {
    return {char: ']', color: ForegroundColor.NavajoWhite3, backgroundColor: BackgroundColor.Black};
  }
}

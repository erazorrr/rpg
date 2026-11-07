import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_DAMAGE, PRICE_PER_DAMAGE_ROLL} from '../../prices';
import {Weapon} from './weapon';

export class CompositeBow extends Weapon {
  public static readonly saveId = 'composite-bow';
  private static readonly baseStats = {damageRoll: 1, damageBonus: 3};

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_DAMAGE_ROLL * CompositeBow.baseStats.damageRoll +
      PRICE_PER_DAMAGE * CompositeBow.baseStats.damageBonus,
    );
    super(context, {...CompositeBow.baseStats}, cost, true);
  }

  public getBaseName(): string { return 'Composite Bow'; }
  public getChar(): Char {
    return {char: 'D', color: ForegroundColor.DarkKhaki, backgroundColor: BackgroundColor.Black};
  }
}

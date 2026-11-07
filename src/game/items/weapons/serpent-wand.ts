import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_MAGIC_BONUS, PRICE_PER_MAGIC_DICE_BONUS} from '../../prices';
import {Weapon} from './weapon';

export class SerpentWand extends Weapon {
  public static readonly saveId = 'serpent-wand';
  private static readonly baseStats = {
    magicRoll: 2,
    magicBonus: 1,
    basicDamageRoll: 2,
    basicDamageBonus: 1,
    basicDamageType: 'poison' as const,
  };

  public constructor(context: Context) {
    const cost = Math.round(
      PRICE_PER_MAGIC_DICE_BONUS * SerpentWand.baseStats.magicRoll +
      PRICE_PER_MAGIC_BONUS * SerpentWand.baseStats.magicBonus +
      PRICE_PER_MAGIC_DICE_BONUS * SerpentWand.baseStats.basicDamageRoll +
      PRICE_PER_MAGIC_BONUS * SerpentWand.baseStats.basicDamageBonus
    );
    super(context, {...SerpentWand.baseStats}, cost, true, true);
  }

  public getBaseName(): string { return 'Serpent Wand'; }
  public getChar(): Char {
    return {char: 'i', color: ForegroundColor.GreenYellow, backgroundColor: BackgroundColor.Black};
  }
}

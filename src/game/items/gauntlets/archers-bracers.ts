import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {PRICE_PER_ARMOR} from '../../prices';
import {Gauntlets} from './gauntlets';

export class ArchersBracers extends Gauntlets {
  public static readonly saveId = 'archers-bracers';
  private static readonly baseStats = {armor: 1};

  public constructor(context: Context) {
    super(
      context,
      {...ArchersBracers.baseStats},
      Math.round(PRICE_PER_ARMOR * ArchersBracers.baseStats.armor),
    );
  }

  public getBaseName(): string { return "Archer's Bracers"; }
  public getChar(): Char {
    return {char: 'u', color: ForegroundColor.DarkSeaGreen, backgroundColor: BackgroundColor.Black};
  }
}

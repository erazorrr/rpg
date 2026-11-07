import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Spell, SpellTarget} from '../spell';

export class LifeDrainSpell extends Spell {
  public static readonly saveId = 'life-drain';
  public readonly keyBinding = 'd';

  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 6,
      damageBonus: 3,
      damageType: 'vampiric',
      lifeStealPercent: .5,
    }, 2);
  }

  public getName(): string { return 'Life Drain'; }
  public getMPCost(): number { return 8; }
  public getProjectile(): Char {
    return {char: '•', color: ForegroundColor.MediumVioletRed, backgroundColor: BackgroundColor.Black};
  }
}

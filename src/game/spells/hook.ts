import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Spell, SpellTarget} from '../spell';

export class HookSpell extends Spell {
  public static readonly saveId = 'hook';
  public readonly keyBinding = 'k';

  constructor() {
    super(SpellTarget.Monster, {damageRoll: 2, damageBonus: 1, pullDistance: 3, range: 6}, 1);
  }

  public getName(): string { return 'Hook'; }
  public getMPCost(): number { return 0; }
  public getProjectile(): Char {
    return {char: '~', color: ForegroundColor.Grey69, backgroundColor: BackgroundColor.Black};
  }
}

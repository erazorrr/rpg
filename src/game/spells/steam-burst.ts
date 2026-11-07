import {Spell, SpellTarget} from '../spell';
import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';

export class SteamBurstSpell extends Spell {
  public static readonly saveId = 'steam-burst';
  public readonly keyBinding = 'u';
  constructor() {
    super(SpellTarget.Monster, {
      damageRoll: 4,
      damageBonus: 2,
      atmosphere: {kind: 'steam', turns: 3, density: 2, shape: 'cross'},
    }, 2);
  }
  public getName(): string { return 'Steam Burst'; }
  public getMPCost(): number { return 7; }
  public getProjectile(): Char {
    return {char: '•', color: ForegroundColor.LightCyan1, backgroundColor: BackgroundColor.Black};
  }
}

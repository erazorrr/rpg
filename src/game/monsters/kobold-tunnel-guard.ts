import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {LeatherArmor} from '../items/chest/leather-armor';
import {ShortSword} from '../items/weapons/short-sword';
import {Npc} from '../npc';

export class KoboldTunnelGuard extends Npc {
  public static readonly saveId = 'kobold-tunnel-guard';
  public strength = 7;
  public dexterity = 9;
  public endurance = 3;
  public hp = this.getMaxHp();
  public equipment = {weapon: new ShortSword(this.context), chest: new LeatherArmor(this.context)};

  public getCowardice(): number { return .25; }
  public getChar(): Char {
    return {char: 'k', color: ForegroundColor.Tan, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Kobold tunnel guard'; }
  public getXp(): number { return 100; }
  public getBaseLootCost(): number { return 4; }
  public getIsBloody(): boolean { return true; }
  protected getShout(): string { return `${this.getName()} braces in the passage!`; }
}

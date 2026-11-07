import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {LeatherArmor} from '../items/chest/leather-armor';
import {Bow} from '../items/weapons/bow';
import {Npc} from '../npc';

export class GnomeArcher extends Npc {
  public static readonly saveId = 'gnome-archer';
  public strength = 5;
  public dexterity = 12;
  public endurance = 2;
  public hp = this.getMaxHp();
  public equipment = {weapon: new Bow(this.context), chest: new LeatherArmor(this.context)};

  public getCowardice(): number { return .35; }
  public getChar(): Char {
    return {char: 'n', color: ForegroundColor.LightGoldenrod2a, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Gnome archer'; }
  public getXp(): number { return 140; }
  public getBaseLootCost(): number { return 6; }
  public getIsBloody(): boolean { return true; }
  protected getShout(): string { return `${this.getName()} raises a compact bow!`; }
}

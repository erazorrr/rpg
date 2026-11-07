import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';

export class CaveLeech extends Npc {
  public static readonly saveId = 'cave-leech';
  public strength = 12;
  public dexterity = 6;
  public endurance = 4;
  public hp = this.getMaxHp();

  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'l', color: ForegroundColor.DarkRed2, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Cave leech'; }
  public getXp(): number { return 140; }
  public getBaseLootCost(): number { return 3; }
  public getIsBloody(): boolean { return true; }
  public getLifeStealPercent(): number { return Math.max(super.getLifeStealPercent(), .5); }
  protected getShout(): string { return `${this.getName()} writhes toward you!`; }
}

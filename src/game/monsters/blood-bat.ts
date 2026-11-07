import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';

export class BloodBat extends Npc {
  public static readonly saveId = 'blood-bat';
  public strength = 10;
  public dexterity = 14;
  public endurance = 1;
  public hp = this.getMaxHp();

  public getCowardice(): number { return .4; }
  public getChar(): Char {
    return {char: 'v', color: ForegroundColor.Red3b, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Blood bat'; }
  public getXp(): number { return 110; }
  public getBaseLootCost(): number { return 2; }
  public getIsBloody(): boolean { return true; }
  public getLifeStealPercent(): number { return Math.max(super.getLifeStealPercent(), .5); }
  protected getShout(): string { return `${this.getName()} screeches!`; }
  protected getFleeMessage(): string { return `${this.getName()} veers away!`; }
}

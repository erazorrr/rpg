import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';
import {State} from '../state';
import {PoisonedState} from '../states/poisoned.state';

export class CaveAsp extends Npc {
  public static readonly saveId = 'cave-asp';
  public strength = 10;
  public dexterity = 12;
  public endurance = 1;
  public hp = this.getMaxHp();

  public getCowardice(): number { return .35; }
  public getChar(): Char {
    return {char: 'a', color: ForegroundColor.GreenYellow, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Cave asp'; }
  public getXp(): number { return 100; }
  public getBaseLootCost(): number { return 2; }
  public getIsBloody(): boolean { return true; }
  protected getShout(): string { return `${this.getName()} hisses!`; }
  protected getOnHitState(): State | null {
    return Math.random() < .4 ? new PoisonedState(10) : null;
  }
}

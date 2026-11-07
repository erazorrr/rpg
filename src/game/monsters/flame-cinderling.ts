import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {DamageType} from '../damage';
import {Npc} from '../npc';
import {State} from '../state';
import {BurningState} from '../states/burning.state';

export class FlameCinderling extends Npc {
  public static readonly saveId = 'flame-cinderling';
  public strength = 10;
  public dexterity = 13;
  public endurance = 10;
  public hp = this.getMaxHp();

  protected getDepthHpBonus(): number { return 0; }

  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'f', color: ForegroundColor.Orange1, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Flame cinderling'; }
  public getXp(): number { return 75; }
  public getBaseLootCost(): number { return 0; }
  public getIsBloody(): boolean { return false; }
  protected getShout(): string { return `${this.getName()} flares!`; }

  protected getOnHitState(): State | null {
    return Math.random() < .3 ? new BurningState(4, 1) : null;
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> { return new Set(['fire']); }
  protected getStateImmunities(): ReadonlySet<string> { return new Set([BurningState.saveId]); }
}

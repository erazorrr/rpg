import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {DamageType} from '../damage';
import {Npc} from '../npc';
import {State} from '../state';
import {FrozenState} from '../states/frozen.state';

export class RimeCinderling extends Npc {
  public static readonly saveId = 'rime-cinderling';
  public strength = 9;
  public dexterity = 12;
  public endurance = 10;
  public hp = this.getMaxHp();

  protected getDepthHpBonus(): number { return 0; }

  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'r', color: ForegroundColor.LightCyan3, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Rime cinderling'; }
  public getXp(): number { return 75; }
  public getBaseLootCost(): number { return 0; }
  public getIsBloody(): boolean { return false; }
  protected getShout(): string { return `${this.getName()} crackles!`; }

  protected getOnHitState(): State | null {
    return Math.random() < .2 ? new FrozenState(2) : null;
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> { return new Set(['frost']); }
  protected getStateImmunities(): ReadonlySet<string> { return new Set([FrozenState.saveId]); }
}

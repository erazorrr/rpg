import {DamageType} from '../damage';
import {Npc} from '../npc';

export abstract class EmberworkMechanism extends Npc {
  public equipment = {};
  public getCowardice(): number { return 0; }
  public getIsBloody(): boolean { return false; }
  protected isImmobile(): boolean { return true; }
  protected getShout(): string { return `${this.getName()} hums with ancient power.`; }
  protected getStateImmunities(): ReadonlySet<string> {
    return new Set(['burning', 'frozen', 'poisoned']);
  }
}

export abstract class IndestructibleEmberworkMechanism extends EmberworkMechanism {
  public damage(_amount: number, _type?: DamageType): number {
    void _type;
    this.logIfObserved(`${this.getName()} cannot be harmed.`, this);
    return 0;
  }
}

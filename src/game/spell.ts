import {State, StateRemoval} from "./state";
import {Char} from "../io/char";
import {AtmosphereEmission} from './atmosphere';
import {DamageType} from './damage';

export enum SpellTarget {
  Monster,
  Self
}

export type SpellStats = {
  state?: () => State;
  stateChance?: number;

  damageRoll?: number;
  damageBonus?: number;
  damageType?: DamageType;
  lifeStealPercent?: number;
  range?: number;

  restoreHp?: number;
  removeState?: StateRemoval;
  atmosphere?: AtmosphereEmission;
  teleportRange?: number;
  pullDistance?: number;
};

export abstract class Spell {
  public abstract readonly keyBinding: string;

  public get saveId(): string {
    return (this.constructor as typeof Spell & {readonly saveId: string}).saveId;
  }

  protected constructor(public readonly target: SpellTarget, public readonly stats: SpellStats, public readonly level: number) {}

  abstract getName(): string;
  abstract getMPCost(): number;

  getProjectile(): Char | null {
    return null;
  }
}

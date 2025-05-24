import {State} from "./state";

export enum SpellTarget {
  Monster,
  Self
}

export type SpellStats = {
  state?: () => State;
  stateChance?: number;

  damageRoll?: number;
  damageBonus?: number;

  restoreHp?: number;
};

export abstract class Spell {
  protected constructor(public readonly target: SpellTarget, public readonly stats: SpellStats, public readonly level: number) {}

  abstract getName(): string;
  abstract getMPCost(): number;
}

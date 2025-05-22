import {CharacterGameObject} from "./character.game-object";

export type StateStats = {
  damageRoll?: number;
  damageBonus?: number;

  armor?: number;

  maxHp?: number;

  strengthBonus?: number;
  dexterityBonus?: number;
  enduranceBonus?: number;
  intelligenceBonus?: number;

  damagePerTurn?: number;

  isUnableToMove?: boolean;
};

export abstract class State {
  private turnsLeft: number;
  protected constructor(public stats: StateStats, public turns: number) {
    this.turnsLeft = turns;
  }

  abstract getActiveMessage(character: CharacterGameObject): string;
  abstract getInactiveMessage(character: CharacterGameObject): string;
  getIncompatibleStates(): Set<new (...args: unknown[]) => State> {
    return new Set();
  }

  tick(): number {
    return --this.turnsLeft;
  }
}

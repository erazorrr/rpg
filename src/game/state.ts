import {CharacterGameObject} from "./character.game-object";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

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

  getForegroundColor(): ForegroundColor | null {
    return null;
  }

  getBackgroundColor(): BackgroundColor | null {
    return null;
  }

  tick(): number {
    return --this.turnsLeft;
  }

  abstract getName(): string;
}

import {CharacterGameObject} from "./character.game-object";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";
import {Saveable, StateSave} from "./save-data";
import {DamageType} from './damage';

export type StateStats = {
  damageRoll?: number;
  damageBonus?: number;

  armor?: number;

  maxHp?: number;

  strengthBonus?: number;
  dexterityBonus?: number;
  enduranceBonus?: number;
  wisdomBonus?: number;

  damagePerTurn?: number;
  damageType?: DamageType;

  isUnableToMove?: boolean;
  isInvisible?: boolean;
};

export type StateRemoval = {
  saveId: string;
  name: string;
};

export abstract class State implements Saveable<StateSave> {
  public get saveId(): string {
    return (this.constructor as typeof State & {readonly saveId: string}).saveId;
  }

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

  public getTurnsLeft(): number {
    return this.turnsLeft;
  }

  public toSaveData(): StateSave {
    return {
      kind: this.saveId,
      turns: this.turnsLeft,
      stats: this.stats,
    };
  }

  abstract getName(): string;
}

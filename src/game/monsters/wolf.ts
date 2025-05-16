import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";

export class Wolf extends Npc {
  strength = 8;
  dexterity = 12;
  endurance = 2;

  protected getVisibilityRadius(): number {
    return 60;
  }

  getCowardice(): number {
    return 0.1;
  }

  getShout() {
    return `${this.getName()} barks!`;
  }

  getChar(): Char {
    return {
      char: 'w',
      color: ForegroundColor.White,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Wolf';
  }

  getXp(): number {
    return 100;
  }

  getBaseLootCost(): number {
    return 4;
  }

  getIsBloody(): boolean {
    return true;
  }
}

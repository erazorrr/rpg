import {Action, Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Context} from "../context";
import {Position} from "../../io/position";

export class Wolf extends Npc {
  protected strength = 8;
  protected dexterity = 12;
  protected endurance = 2;

  constructor(context: Context, public position: Position) {
    super(context);
  }

  decideAction(): Action {
    const player = this.context.getPlayer();
    if (player.position.distanceTo(this.position) < 60) {
      if (this.hp < this.getMaxHp() * 0.1) {
        if (this.previousAction === Action.Attack) {
          this.context.log(`${this.getName()} tries to run!`);
        }
        return Action.Flee;
      }
      if (this.previousAction !== Action.Attack) {
        this.context.log(`${this.getName()} barks!`);
      }
      return Action.Attack;
    }
    return Action.Nothing;
  }

  getChar(): Char {
    return {
      char: 'w',
      color: ForegroundColor.Grey35,
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
    return 5;
  }

  getIsBloody(): boolean {
    return true;
  }
}

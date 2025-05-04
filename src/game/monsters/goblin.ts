import {Action, Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Context} from "../context";
import {Position} from "../../io/position";

export class Goblin extends Npc {
  protected strength = 6;
  protected dexterity = 8;
  protected endurance = 4;

  constructor(context: Context, public position: Position) {
    super(context);
  }

  decideAction(): Action {
    const player = this.context.getPlayer();
    if (player.position.distanceTo(this.position) < 60) {
      if (this.hp < this.getMaxHp() * 0.3) {
        if (this.previousAction !== Action.Flee) {
          this.context.log(`${this.getName()} tries to run!`);
        }
        return Action.Flee;
      }
      if (this.previousAction !== Action.Attack) {
        this.context.log(`${this.getName()} shouts!`);
      }
      return Action.Attack;
    }
    return Action.Nothing;
  }

  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.Green,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getName(): string {
    return 'Goblin';
  }

  getXp(): number {
    return 100;
  }
}

import {Action, Npc} from "../npc";
import {Context} from "../context";
import {Position} from "../../io/position";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {GreatAxe} from "../items/weapons/great-axe";
import {IronModifier} from "../item-modifiers/weapon/material/iron";

export class Ogre extends Npc {
  protected strength = 14;
  protected dexterity = 6;
  protected endurance = 5;

  constructor(context: Context, public position: Position) {
    super(context);
  }

  decideAction(): Action {
    const player = this.context.getPlayer();
    if (player.position.distanceTo(this.position) < 20) {
      if (this.previousAction !== Action.Attack) {
        this.context.log(`${this.getName()} shouts!`);
      }
      return Action.Attack;
    }
    return Action.Nothing;
  }

  getChar(): Char {
    return {
      char: 'O',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Orge';
  }

  getXp(): number {
    return 500;
  }

  getBaseLootCost(): number {
    return 10;
  }

  public equipment = {
    weapon: new GreatAxe(this.context).applyModifier(new IronModifier()),
  };

  getIsBloody(): boolean {
    return true;
  }
}

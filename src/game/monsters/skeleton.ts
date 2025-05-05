import {Action, Npc} from "../npc";
import {Context} from "../context";
import {Position} from "../../io/position";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {ShortSword} from "../items/weapons/short-sword";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";

export class Skeleton extends Npc {
  protected strength = 12;
  protected dexterity = 6;
  protected endurance = 4;

  constructor(context: Context, public position: Position) {
    super(context);
  }

  decideAction(): Action {
    const player = this.context.getPlayer();
    if (player.position.distanceTo(this.position) < 30) {
      if (this.previousAction !== Action.Attack) {
        this.context.log(`${this.getName()} shrieks!`);
      }
      return Action.Attack;
    }
    return Action.Nothing;
  }

  getChar(): Char {
    return {
      char: 'S',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Skeleton';
  }

  getXp(): number {
    return 450;
  }

  getBaseLootCost(): number {
    return 9;
  }

  public equipment = {
    weapon: new ShortSword(this.context).applyModifier(new SteelModifier()),
  };

  getIsBloody(): boolean {
    return false;
  }
}

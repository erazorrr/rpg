import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Context} from "../context";
import {Position} from "../../io/position";
import {Level} from "../level";

export class TreasureGoblin extends Npc {
  strength = 6;
  dexterity = 10;
  endurance = 3;

  private timer = 40;
  private timerStarted = false;
  constructor(context: Context, gameLevel: Level, position: Position, private _baseLootCost: number) {
    super(context, gameLevel, position);
  }

  protected getVisibilityRadius(): number {
    return 60;
  }

  getCowardice(): number {
    return 1.0;
  }

  getChar(): Char {
    return {
      char: 't',
      color: ForegroundColor.Gold1,
      backgroundColor: BackgroundColor.Green,
    };
  }


  tick() {
    if (this.timerStarted) {
      this.timer--;
      if (this.timer == 0) {
        this.context.log(`${this.getName()} disappeared!`);
        this.context.destroyNpc(this);
      } else if (this.timer <= 10 || this.timer % 5 === 0) {
        this.context.log(`${this.getName()} will disappear in ${this.timer} turns!`);
      }
    } else if (this.isActive() && this.context.getPlayer().isVisible(this.position)) {
      this.timerStarted = true;
      this.context.log(`${this.getName()} saw you! He will disappear in ${this.timer} turns!`);
    }
    super.tick();
  }

  getBaseName(): string {
    return 'Treasure goblin';
  }

  getXp(): number {
    return 100;
  }

  getBaseLootCost(): number {
    return this._baseLootCost;
  }

  public equipment = {};

  getIsBloody(): boolean {
    return true;
  }
}

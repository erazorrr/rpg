import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Context} from "../context";
import {Position} from "../../io/position";
import {Level} from "../level";
import {NpcSave} from "../save-data";
import {AnimationFrame} from "../animation";

export class TreasureGoblin extends Npc {
  public static readonly saveId: string = "treasure-goblin";

  strength = 6;
  dexterity = 10;
  endurance = 5;

  private timer = 40;
  private timerStarted = false;
  constructor(context: Context, gameLevel: Level, position: Position, private _baseLootCost: number) {
    super(context, gameLevel, position);
  }

  getCowardice(): number {
    return 1.0;
  }

  getChar(frame?: AnimationFrame): Char {
    const cadence = this.timerStarted ? 2 : 3;
    const colors = [ForegroundColor.Gold1, ForegroundColor.Yellow1, ForegroundColor.Gold3b];
    const phase = Math.floor((frame?.frame ?? 0) / cadence) % colors.length;
    return {
      char: 't',
      color: colors[phase],
      backgroundColor: BackgroundColor.Green,
    };
  }


  tick() {
    if (this.timerStarted) {
      this.timer--;
      if (this.timer == 0) {
        this.logIfObserved(`${this.getName()} disappeared!`, this);
        this.context.destroyNpc(this);
      } else if (this.timer <= 10 || this.timer % 5 === 0) {
        this.logIfObserved(`${this.getName()} will disappear in ${this.timer} turns!`, this);
      }
    } else if (this.isActive() && this.context.getPlayer().canSeeCharacter(this)) {
      this.timerStarted = true;
      this.logIfObserved(`${this.getName()} saw you and will disappear in ${this.timer} turns!`, this);
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

  public getTimer(): number { return this.timer; }
  public hasTimerStarted(): boolean { return this.timerStarted; }
  public restoreTimer(timer: number, started: boolean): void {
    this.timer = timer;
    this.timerStarted = started;
  }

  public toSaveData(): NpcSave {
    return {
      ...super.toSaveData(),
      treasure: {
        cost: this._baseLootCost,
        timer: this.timer,
        started: this.timerStarted,
      },
    };
  }

  public equipment = {};

  getIsBloody(): boolean {
    return true;
  }
}

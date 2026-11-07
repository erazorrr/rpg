import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Context} from '../context';
import {Level} from '../level';
import {Npc} from '../npc';
import {NpcSave} from '../save-data';
import {Position} from '../../io/position';

export class BoundFamiliar extends Npc {
  public static readonly saveId = 'bound-familiar';
  public strength = 7;
  public dexterity = 13;
  public endurance = 1;
  public hp = this.getMaxHp();
  public equipment = {};

  constructor(context: Context, level: Level, position: Position, public readonly ownerId: string) {
    super(context, level, position);
  }

  protected getDepthHpBonus(): number { return 0; }
  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'd', color: ForegroundColor.Magenta2, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Bound familiar'; }
  public getXp(): number { return 20; }
  public getBaseLootCost(): number { return 0; }
  public getIsBloody(): boolean { return false; }
  protected getShout(): string { return `${this.getName()} slips through the violet seam!`; }

  public toSaveData(): NpcSave {
    return {...super.toSaveData(), familiar: {ownerId: this.ownerId}};
  }
}

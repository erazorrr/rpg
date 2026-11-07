import {randomUUID} from 'node:crypto';
import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {DamageType} from '../damage';
import {Context} from '../context';
import {Wand} from '../items/weapons/wand';
import {Level} from '../level';
import {Npc, Action} from '../npc';
import {NpcSave} from '../save-data';
import {BoundFamiliar} from './bound-familiar';

export class GnomeWarlock extends Npc {
  public static readonly saveId = 'gnome-warlock';
  public strength = 4;
  public dexterity = 8;
  public endurance = 2;
  public wisdom = 8;
  public hp = this.getMaxHp();
  public equipment = {weapon: new Wand(this.context)};
  private summonsRemaining = 2;

  constructor(
    context: Context,
    level: Level,
    position: Position,
    public readonly warlockId: string = randomUUID(),
  ) {
    super(context, level, position);
  }

  public getCowardice(): number { return .4; }
  public getChar(): Char {
    return {char: 'n', color: ForegroundColor.MediumPurple1, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Gnome warlock'; }
  public getXp(): number { return 220; }
  public getBaseLootCost(): number { return 7; }
  public getIsBloody(): boolean { return true; }
  public restoreSummonsRemaining(count: number): void { this.summonsRemaining = count; }

  protected takeSpecialAction(): boolean {
    if (this.summonsRemaining <= 0 || !this.canSeeCharacter(this.context.getPlayer())) return false;
    const active = this.gameLevel.getNpcs().filter(
      npc => npc instanceof BoundFamiliar && npc.ownerId === this.warlockId,
    ).length;
    if (active >= 2) return false;
    const positions = [this.position.up(), this.position.right(), this.position.down(), this.position.left()];
    const destination = positions.find(position =>
      this.context.getCurrentMap().isNavigable(position) && this.context.getIsFree(position)
    );
    if (!destination) return false;
    this.gameLevel.putNpc(new BoundFamiliar(this.context, this.gameLevel, destination, this.warlockId));
    this.summonsRemaining--;
    this.previousAction = Action.Attack;
    this.lastSeenPlayerPosition = this.context.getPlayer().position;
    this.logIfObserved(`${this.getName()} presses a branded palm to a pact-stone.`, this);
    return true;
  }

  public damage(amount: number, type: DamageType = 'physical'): number {
    const dealt = super.damage(amount, type);
    if (this.getHp() === 0) {
      const familiars = this.gameLevel.getNpcs().filter(
        npc => npc instanceof BoundFamiliar && npc.ownerId === this.warlockId,
      );
      for (const familiar of familiars) this.context.destroyNpc(familiar);
      if (familiars.length > 0) {
        this.logIfObserved('The warlock\'s bound familiars unravel into violet sparks.', this, ...familiars);
      }
    }
    return dealt;
  }

  public toSaveData(): NpcSave {
    return {
      ...super.toSaveData(),
      warlock: {id: this.warlockId, summonsRemaining: this.summonsRemaining},
    };
  }
}

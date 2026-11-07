import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {ShortSword} from '../items/weapons/short-sword';
import {Npc, Action} from '../npc';
import {NpcSave} from '../save-data';

export class KoboldSalvekeeper extends Npc {
  public static readonly saveId = 'kobold-salvekeeper';
  public strength = 5;
  public dexterity = 9;
  public endurance = 2;
  public hp = this.getMaxHp();
  private salves = 3;
  public equipment = {weapon: new ShortSword(this.context)};

  public getCowardice(): number { return .5; }
  public getChar(): Char {
    return {char: 'k', color: ForegroundColor.LightGreen, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Kobold salvekeeper'; }
  public getXp(): number { return 140; }
  public getBaseLootCost(): number { return 5; }
  public getIsBloody(): boolean { return true; }
  public restoreSalves(charges: number): void { this.salves = charges; }

  protected takeSpecialAction(): boolean {
    if (this.salves <= 0) return false;
    const player = this.context.getPlayer();
    if (this.previousAction === Action.Nothing && !this.canSeeCharacter(player)) return false;
    const wounded = this.gameLevel.getNpcs().filter(npc =>
      npc !== this && npc.getIsBloody() && npc.getHp() > 0 && npc.getHp() < npc.getMaxHp() &&
      this.position.manhattanDistanceTo(npc.position) <= 5 && this.canSeeCharacter(npc)
    ).sort((a, b) => a.getHp() / a.getMaxHp() - b.getHp() / b.getMaxHp());
    const target = wounded[0];
    if (!target) return false;
    const restored = Math.min(8, target.getMaxHp() - target.hp);
    target.hp += restored;
    this.salves--;
    this.previousAction = Action.Attack;
    this.logIfObserved(`${this.getName()} restores ${target.getName()} ${restored} health with a Veyran salve.`, this, target);
    return true;
  }

  public toSaveData(): NpcSave {
    return {...super.toSaveData(), healer: {charges: this.salves}};
  }
}

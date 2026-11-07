import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {LeatherArmor} from '../items/chest/leather-armor';
import {ShortSword} from '../items/weapons/short-sword';
import {Npc, Action} from '../npc';
import {HookSpell} from '../spells/hook';

export class KoboldHookBearer extends Npc {
  public static readonly saveId = 'kobold-hook-bearer';
  public strength = 6;
  public dexterity = 11;
  public endurance = 2;
  public hp = this.getMaxHp();
  public equipment = {weapon: new ShortSword(this.context), chest: new LeatherArmor(this.context)};

  public getCowardice(): number { return .35; }
  public getChar(): Char {
    return {char: 'k', color: ForegroundColor.LightSteelBlue, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Kobold hook-bearer'; }
  public getXp(): number { return 130; }
  public getBaseLootCost(): number { return 5; }
  public getIsBloody(): boolean { return true; }

  protected takeSpecialAction(): boolean {
    const player = this.context.getPlayer();
    const distance = this.position.manhattanDistanceTo(player.position);
    const aligned = this.position.x === player.position.x || this.position.y === player.position.y;
    if (!aligned || distance < 2 || distance > 6 || !this.canSeeCharacter(player)) return false;
    this.previousAction = Action.Attack;
    this.lastSeenPlayerPosition = player.position;
    player.applySpell(this, new HookSpell());
    return true;
  }
}

import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {CopperModifier} from '../item-modifiers/weapon/material/copper';
import {LeatherArmor} from '../items/chest/leather-armor';
import {ShortSword} from '../items/weapons/short-sword';
import {Goblin} from './goblin';

export class GoblinSkirmisher extends Goblin {
  public static readonly saveId = 'goblin-skirmisher';

  public dexterity = 12;
  public endurance = 1;
  public hp = this.getMaxHp();

  public getChar(): Char {
    return {char: 'g', color: ForegroundColor.Chartreuse1, backgroundColor: BackgroundColor.Black};
  }

  public getBaseName(): string { return 'Goblin skirmisher'; }
  public getXp(): number { return 120; }
  public getBaseLootCost(): number { return 4; }

  public equipment = {
    weapon: new ShortSword(this.context).applyModifier(new CopperModifier()),
    chest: new LeatherArmor(this.context),
  };
}

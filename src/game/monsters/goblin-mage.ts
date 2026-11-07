import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Goblin} from "./goblin";
import {Spell} from "../spell";
import {FireBoltSpell} from "../spells/fire-bolt";
import {SmokeVeilSpell} from '../spells/smoke-veil';

export class GoblinMage extends Goblin {
  public static readonly saveId: string = "goblin-mage";

  strength = 6;
  dexterity = 6;
  endurance = 1;
  wisdom = 1;

  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.Orchid1,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Goblin mage';
  }

  getXp(): number {
    return 150;
  }

  getBaseLootCost(): number {
    return 6;
  }

  public equipment = {
    weapon: undefined,
    chest: undefined,
  };

  protected getSelfSpell(): Spell | null {
    const player = this.context.getPlayer();
    const threatened = this.hp <= this.getMaxHp() * .6 || this.position.manhattanDistanceTo(player.position) <= 4;
    return threatened && !this.gameLevel.getAtmosphere(this.position) ? new SmokeVeilSpell() : null;
  }

  getSpellLogic(): {
    buffs: Array<Spell>;
    attack: Array<Spell>
  } | null {
    return {
      attack: [new FireBoltSpell()],
      buffs: [],
    }
  }
}

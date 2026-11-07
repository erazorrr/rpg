import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Ogre} from "./ogre";
import {Spell} from "../spell";
import {FireBoltSpell} from "../spells/fire-bolt";
import {EmpowerOtherSpell} from "../spells/empower-other";
import {FortifyOtherSpell} from "../spells/fortify-other";
import {SteamBurstSpell} from '../spells/steam-burst';
import {BlinkSpell} from '../spells/blink';

export class OgreMage extends Ogre {
  public static readonly saveId: string = "ogre-mage";

  strength = 12;
  wisdom = 2;
  endurance = 15;

  getChar(): Char {
    return {
      char: 'O',
      color: ForegroundColor.Purple,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Ogre mage';
  }

  getXp(): number {
    return 700;
  }

  getBaseLootCost(): number {
    return 12;
  }

  public equipment = {
    weapon: undefined,
    chest: undefined,
    gauntlets: undefined,
  };

  protected getSelfSpell(): Spell | null {
    const player = this.context.getPlayer();
    const threatened = this.position.manhattanDistanceTo(player.position) <= 2;
    return threatened && Math.random() < .25 ? new BlinkSpell() : null;
  }

  getSpellLogic(): {
    buffs: Array<Spell>;
    attack: Array<Spell>
  } | null {
    return {
      attack: [new FireBoltSpell(), new SteamBurstSpell()],
      buffs: [new EmpowerOtherSpell(), new FortifyOtherSpell()],
    }
  }
}

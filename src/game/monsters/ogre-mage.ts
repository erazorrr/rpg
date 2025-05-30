import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Ogre} from "./ogre";
import {Spell} from "../spell";
import {FireBoltSpell} from "../spells/fire-bolt";
import {EmpowerOtherSpell} from "../spells/empower-other";
import {FortifyOtherSpell} from "../spells/fortify-other";

export class OgreMage extends Ogre {
  strength = 12;
  wisdom = 2;
  endurance = 3;

  getChar(): Char {
    return {
      char: 'O',
      color: ForegroundColor.Purple,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Orge Mage';
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

  getSpellLogic(): {
    buffs: Array<Spell>;
    attack: Array<Spell>
  } | null {
    return {
      attack: [new FireBoltSpell()],
      buffs: [new EmpowerOtherSpell(), new FortifyOtherSpell()],
    }
  }
}

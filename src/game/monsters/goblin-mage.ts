import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Goblin} from "./goblin";
import {Spell} from "../spell";
import {FireBoltSpell} from "../spells/fire-bolt";

export class GoblinMage extends Goblin {
  strength = 6;
  dexterity = 6;
  endurance = 1;
  wisdom = 1;

  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.BlueViolet,
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

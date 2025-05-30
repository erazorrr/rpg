import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {GreatAxe} from "../items/weapons/great-axe";
import {IronModifier} from "../item-modifiers/weapon/material/iron";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";
import {PlateMail} from "../items/chest/plate-mail";
import {PlateGauntlets} from "../items/gauntlets/plate-gauntlets";

export class Ogre extends Npc {
  strength = 14;
  dexterity = 6;
  endurance = 5;
  wisdom = 2;

  getCowardice(): number {
    return 0;
  }

  getChar(): Char {
    return {
      char: 'O',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Orge';
  }

  getXp(): number {
    return 500;
  }

  getBaseLootCost(): number {
    return 10;
  }

  public equipment = {
    weapon: new GreatAxe(this.context).applyModifier(new IronModifier()),
    chest: new PlateMail(this.context).applyModifier(new SteelModifier()),
    gauntlets: new PlateGauntlets(this.context).applyModifier(new IronModifier()),
  };

  getIsBloody(): boolean {
    return true;
  }
}

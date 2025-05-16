import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {GreatAxe} from "../items/weapons/great-axe";
import {IronModifier} from "../item-modifiers/weapon/material/iron";
import {ChainMail} from "../items/chest/chain-mail";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";

export class Ogre extends Npc {
  strength = 14;
  dexterity = 6;
  endurance = 5;

  protected getVisibilityRadius(): number {
    return 15;
  }

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
    chest: new ChainMail(this.context).applyModifier(new SteelModifier()),
  };

  getIsBloody(): boolean {
    return true;
  }
}

import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {ShortSword} from "../items/weapons/short-sword";
import {CopperModifier} from "../item-modifiers/weapon/material/copper";
import {ChainMail} from "../items/chest/chain-mail";
import {IronModifier} from "../item-modifiers/weapon/material/iron";

export class Goblin extends Npc {
  strength = 6;
  dexterity = 8;
  endurance = 3;

  protected getVisibilityRadius(): number {
    return 40;
  }

  getCowardice(): number {
    return 0.3;
  }

  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.Green,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Goblin';
  }

  getXp(): number {
    return 100;
  }

  getBaseLootCost(): number {
    return 4;
  }

  public equipment = {
    weapon: new ShortSword(this.context).applyModifier(new CopperModifier()),
    chest: new ChainMail(this.context).applyModifier(new IronModifier()),
  };

  getIsBloody(): boolean {
    return true;
  }
}

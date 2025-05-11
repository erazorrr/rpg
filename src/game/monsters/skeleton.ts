import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {ShortSword} from "../items/weapons/short-sword";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";
import {ChainMail} from "../items/chest/chain-mail";

export class Skeleton extends Npc {
  protected strength = 16;
  protected dexterity = 10;
  protected endurance = 4;

  getShout() {
    return `${this.getName()} shrieks!`;
  }

  getCowardice(): number {
    return 0;
  }

  getChar(): Char {
    return {
      char: 'S',
      color: ForegroundColor.Yellow,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Skeleton';
  }

  getXp(): number {
    return 450;
  }

  getBaseLootCost(): number {
    return 13;
  }

  public equipment = {
    weapon: new ShortSword(this.context).applyModifier(new SteelModifier()),
    chest: new ChainMail(this.context).applyModifier(new SteelModifier()),
  };

  getIsBloody(): boolean {
    return false;
  }
}

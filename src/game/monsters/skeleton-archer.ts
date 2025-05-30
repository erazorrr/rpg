import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";
import {ChainMail} from "../items/chest/chain-mail";
import {PlateGauntlets} from "../items/gauntlets/plate-gauntlets";
import {PlateBoots} from "../items/boots/plate-boots";
import {Skeleton} from "./skeleton";
import {Crossbow} from "../items/weapons/crossbow";

export class SkeletonArcher extends Skeleton {
  strength = 10;
  dexterity = 12;
  endurance = 4;

  getChar(): Char {
    return {
      char: 'S',
      color: ForegroundColor.DarkOrange,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Skeleton archer';
  }

  getXp(): number {
    return 600;
  }

  getBaseLootCost(): number {
    return 13;
  }

  public equipment = {
    weapon: new Crossbow(this.context),
    chest: new ChainMail(this.context).applyModifier(new SteelModifier()),
    gauntlets: new PlateGauntlets(this.context).applyModifier(new SteelModifier()),
    boots: new PlateBoots(this.context).applyModifier(new SteelModifier()),
  };

  getIsBloody(): boolean {
    return false;
  }
}

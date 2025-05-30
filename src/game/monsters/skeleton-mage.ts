import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";
import {ChainMail} from "../items/chest/chain-mail";
import {PlateGauntlets} from "../items/gauntlets/plate-gauntlets";
import {PlateBoots} from "../items/boots/plate-boots";
import {Skeleton} from "./skeleton";
import {Spell} from "../spell";
import {IceShardSpell} from "../spells/ice-shard";
import {IceRaySpell} from "../spells/ice-ray";
import {FreezeSpell} from "../spells/freeze";
import {Wand} from "../items/weapons/wand";

export class SkeletonMage extends Skeleton {
  strength = 10;
  dexterity = 10;
  endurance = 3;
  wisdom = 8;


  getChar(): Char {
    return {
      char: 'S',
      color: ForegroundColor.Purple,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Skeleton Mage';
  }

  getXp(): number {
    return 700;
  }

  getBaseLootCost(): number {
    return 15;
  }

  public equipment = {
    weapon: new Wand(this.context),
    chest: new ChainMail(this.context).applyModifier(new SteelModifier()),
    gauntlets: new PlateGauntlets(this.context).applyModifier(new SteelModifier()),
    boots: new PlateBoots(this.context).applyModifier(new SteelModifier()),
  };

  getSpellLogic(): {
    buffs: Array<Spell>;
    attack: Array<Spell>
  } | null {
    return {
      attack: [new IceRaySpell(), new IceShardSpell(), new FreezeSpell()],
      buffs: [],
    }
  }
}

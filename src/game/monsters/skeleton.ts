import {Npc} from "../npc";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {ShortSword} from "../items/weapons/short-sword";
import {SteelModifier} from "../item-modifiers/weapon/material/steel";
import {ChainMail} from "../items/chest/chain-mail";
import {PlateGauntlets} from "../items/gauntlets/plate-gauntlets";
import {PlateBoots} from "../items/boots/plate-boots";
import {DamageType} from '../damage';
import {PoisonedState} from '../states/poisoned.state';

export class Skeleton extends Npc {
  public static readonly saveId: string = "skeleton";

  strength = 16;
  dexterity = 8;
  endurance = 20;

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
    return 11;
  }

  public equipment = {
    weapon: new ShortSword(this.context).applyModifier(new SteelModifier()),
    chest: new ChainMail(this.context).applyModifier(new SteelModifier()),
    gauntlets: new PlateGauntlets(this.context).applyModifier(new SteelModifier()),
    boots: new PlateBoots(this.context).applyModifier(new SteelModifier()),
  };

  getIsBloody(): boolean {
    return false;
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> {
    return new Set(['poison']);
  }

  protected getStateImmunities(): ReadonlySet<string> {
    return new Set([PoisonedState.saveId]);
  }
}

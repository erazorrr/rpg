import {Item} from "./item";
import {Health} from "./item-modifiers/health";
import {Endurance} from "./item-modifiers/endurance";
import {Dexterity} from "./item-modifiers/dexterity";
import {Strength} from "./item-modifiers/strength";
import {AntiEndurance} from "./item-modifiers/anti-endurance";
import {AntiDexterity} from "./item-modifiers/anti-dexterity";
import {AntiStrength} from "./item-modifiers/anti-strength";
import {AntiHealth} from "./item-modifiers/anti-health";
import {ChampionStrength} from "./item-modifiers/champion-strength";
import {ChampionDexterity} from "./item-modifiers/champion-dexterity";
import {ChampionEndurance} from "./item-modifiers/champion-endurance";
import {ChampionHealth} from "./item-modifiers/champion-health";
import {GiantDexterity} from "./item-modifiers/giant-dexterity";
import {GiantHealth} from "./item-modifiers/giant-health";
import {GiantEndurance} from "./item-modifiers/giant-endurance";
import {GiantStrength} from "./item-modifiers/giant-strength";
import {Context} from "./context";
import {ItemModifier} from "./item-modifier";
import {ShortSword} from "./items/weapons/short-sword";
import {GreatAxe} from "./items/weapons/great-axe";
import {CopperModifier} from "./item-modifiers/weapon/material/copper";
import {IronModifier} from "./item-modifiers/weapon/material/iron";
import {SteelModifier} from "./item-modifiers/weapon/material/steel";
import {LeatherArmor} from "./items/chest/leather-armor";
import {NopModifier} from "./item-modifiers/nop";
import {ChainMail} from "./items/chest/chain-mail";
import {CopperArmorModifier} from "./item-modifiers/armor/material/copper";
import {IronArmorModifier} from "./item-modifiers/armor/material/iron";
import {SteelArmorModifier} from "./item-modifiers/armor/material/steel";
import {HealthPotion} from "./items/potions/health";
import {SmallHealthPotion} from "./items/potions/small-health";
import {LargeHealthPotion} from "./items/potions/large-health";
import {LeatherBoots} from "./items/boots/leather-boots";
import {MetalBoots} from "./items/boots/metal-boots";
import {LeatherGauntlets} from "./items/gauntlets/leather-gauntlets";
import {MetalGauntlets} from "./items/gauntlets/metal-gauntlets";
import {GameObject} from "./abstract.game-object";

export class LootGenerator extends GameObject {
  private readonly commonModifiers: (new () => ItemModifier)[];
  private opposites: Map<ItemModifier, Set<ItemModifier>>;
  private readonly loot: Record<number, Array<Item>>;

  constructor(context: Context) {
    super(context);

    this.commonModifiers = [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth, ChampionStrength, ChampionDexterity, ChampionEndurance, ChampionHealth, GiantDexterity, GiantHealth, GiantEndurance, GiantStrength];
    const _items: Array<[Array<new (ctx: Context) => Item>, Array<new () => ItemModifier>, Array<new () => ItemModifier>]> = [
      [[ShortSword, GreatAxe], [CopperModifier, IronModifier, SteelModifier], this.commonModifiers],
      [[LeatherArmor], [NopModifier], this.commonModifiers],
      [[ChainMail], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
      [[HealthPotion], [NopModifier], new Array(this.commonModifiers.length).fill(NopModifier)],
      [[SmallHealthPotion], [NopModifier], new Array(this.commonModifiers.length).fill(NopModifier)],
      [[LargeHealthPotion], [NopModifier], new Array(this.commonModifiers.length).fill(NopModifier)],
      [[LeatherBoots], [NopModifier], this.commonModifiers],
      [[MetalBoots], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
      [[LeatherGauntlets], [NopModifier], this.commonModifiers],
      [[MetalGauntlets], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
    ];
    this.opposites = this.commonModifiers.reduce((acc, mod) => {
      acc.set(mod, new Set());
      const instance = new mod();
      for (const otherMod of this.commonModifiers) {
        for (const [key, value] of Object.entries(new otherMod().stats)) {
          if (value && instance.stats[key] !== 0 && mod !== otherMod) {
            acc.get(mod)!.add(otherMod);
          }
        }
      }
      return acc;
    }, new Map());

    this.loot = _items.reduce((acc, [items, modifiers, modifiers1]) => {
      function* subsets(array, offset = 0) {
        while (offset < array.length) {
          let first = array[offset++];
          for (let subset of subsets(array, offset)) {
            subset.push(first);
            yield subset;
          }
        }
        yield [];
      }

      for (const item of items) {
        const base = new item(this.context);
        for (const modifier of modifiers) {
          const res = base.clone();
          res.applyModifier(new modifier());
          const cost = res.getCost();
          if (!acc[cost]) {
            acc[cost] = [];
          }
          acc[cost].push(res);

          for (const additionalModifiers of subsets(modifiers1)) {
            if (additionalModifiers.length > 2) {
              continue;
            }
            if (this.hasOpposites(additionalModifiers)) {
              continue;
            }

            const res1 = res.clone();
            for (const modifier1 of additionalModifiers) {
              res1.applyModifier(new modifier1());
            }
            const cost1 = res1.getCost();
            if (cost <= 0) {
              continue;
            }
            if (!acc[cost1]) {
              acc[cost1] = [];
            }
            acc[cost1].push(res1);
          }
        }
      }
      return acc;
    }, {});
  }

  private hasOpposites(arr: Array<ItemModifier>): boolean {
    let hasOpposites = false;
    outer: for (let i = 0; i < arr.length; i++) {
      const opposites = this.opposites.get(arr[i]);
      if (opposites) {
        for (const opposite of opposites) {
          if (arr.some(m => m === opposite)) {
            hasOpposites = true;
            break outer;
          }
        }
      }
    }
    return hasOpposites;
  }

  public generateLoot(cost: number): Item | null {
    let roll = Math.ceil(Math.random() * cost);
    let possibleItems: Item[];
    let change = 0;
    do {
      possibleItems = this.loot[roll];
      roll--;
      change++;
    } while (roll > 0 && !possibleItems);
    if (possibleItems) {
      return possibleItems[Math.floor(Math.random() * possibleItems.length)];
    }
    return null;
  }
}

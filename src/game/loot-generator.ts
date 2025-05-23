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
import {LeviathanStrength} from "./item-modifiers/leviathan-strength";
import {LeviathanEndurance} from "./item-modifiers/leviathan-endurance";
import {ChampionAntiEndurance} from "./item-modifiers/champion-anti-endurance";
import {ChampionAntiDexterity} from "./item-modifiers/champion-anti-dexterity";
import {ChampionAntiStrength} from "./item-modifiers/champion-anti-strength";
import {ChampionAntiHealth} from "./item-modifiers/champion-anti-health";
import {Debug} from "../debug";
import {ChampionHealthPotion} from "./items/potions/champion-health";
import {GiantHealthPotion} from "./items/potions/giant-health";
import {HandAxe} from "./items/weapons/hand-axe";
import {PlateBoots} from "./items/boots/plate-boots";
import {PlateMail} from "./items/chest/plate-mail";
import {PlateGauntlets} from "./items/gauntlets/plate-gauntlets";
import {LongSword} from "./items/weapons/long-sword";
import {StrengthPotion} from "./items/potions/strength";
import {ArmorPotion} from "./items/potions/armor";
import {ChampionArmorPotion} from "./items/potions/champion-armor";
import {ChampionStrengthPotion} from "./items/potions/champion-strength";
import {SmallManaPotion} from "./items/potions/small-mana";
import {ManaPotion} from "./items/potions/mana";
import {LargeManaPotion} from "./items/potions/large-mana";
import {ChampionManaPotion} from "./items/potions/champion-mana";
import {GiantManaPotion} from "./items/potions/giant-mana";
import {HpReplen} from "./item-modifiers/hp-replen";
import {MpReplen} from "./item-modifiers/mp-replen";
import {AntiIntelligence} from "./item-modifiers/anti-intelligence";
import {ChampionAntiIntelligence} from "./item-modifiers/champion-anti-intelligence";
import {Intelligence} from "./item-modifiers/intelligence";
import {ChampionIntelligence} from "./item-modifiers/champion-intelligence";
import {GiantIntelligence} from "./item-modifiers/giant-intelligence";
import {LeviathanIntelligence} from "./item-modifiers/leviathan-intelligence";
import {Focus} from "./item-modifiers/focus";
import {ChampionFocus} from "./item-modifiers/champion-focus";
import {GiantFocus} from "./item-modifiers/giant-focus";
import {Power} from "./item-modifiers/power";
import {ChampionPower} from "./item-modifiers/champion-power";
import {GiantPower} from "./item-modifiers/giant-power";
import {Robe} from "./items/chest/robe";
import {Staff} from "./items/weapons/staff";
import {Wand} from "./items/weapons/wand";

type ItemModifierBuilder = new () => ItemModifier;

export class LootGenerator extends GameObject {
  private debug: Debug = new Debug('loot-generator.log');
  private readonly commonModifiers: ItemModifierBuilder[];
  private readonly magicModifiers: ItemModifierBuilder[];
  private readonly magicWeaponModifiers: ItemModifierBuilder[];
  private opposites: Map<ItemModifierBuilder, Set<ItemModifierBuilder>>;
  private readonly loot: Record<number, Array<Item>>;

  constructor(context: Context) {
    super(context);

    this.commonModifiers = [
      Health, Endurance, Dexterity, Strength,
      AntiEndurance, AntiDexterity, AntiStrength, AntiHealth,
      ChampionAntiEndurance, ChampionAntiDexterity, ChampionAntiStrength, ChampionAntiHealth,
      ChampionStrength, ChampionDexterity, ChampionEndurance, ChampionHealth,
      GiantDexterity, GiantHealth, GiantEndurance, GiantStrength,
      LeviathanStrength, LeviathanEndurance,
      HpReplen,
      AntiIntelligence, ChampionAntiIntelligence,
    ];
    this.magicModifiers = [
      MpReplen,
      Intelligence, ChampionIntelligence, GiantIntelligence, LeviathanIntelligence,
    ];
    this.magicWeaponModifiers = [
      Focus, ChampionFocus, GiantFocus,
      Power, ChampionPower, GiantPower,
    ];
    const _items: Array<[Array<new (ctx: Context) => Item>, number, ItemModifierBuilder[], ItemModifierBuilder[]]> = [
      [[ShortSword, HandAxe, GreatAxe, LongSword], 1, [CopperModifier, IronModifier, SteelModifier], this.commonModifiers],
      [[LeatherArmor], 1, [NopModifier], this.commonModifiers],
      [[Robe], 1, [NopModifier], this.magicModifiers],
      [[Staff, Wand], 1, [NopModifier], [...this.magicModifiers, ...this.magicWeaponModifiers]],
      [[ChainMail, PlateMail], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
      [[StrengthPotion, ArmorPotion], 4, [NopModifier], []],
      [[ChampionArmorPotion, ChampionStrengthPotion], 20, [NopModifier], []],
      [[HealthPotion], 160, [NopModifier], []],
      [[SmallHealthPotion], 30, [NopModifier], []],
      [[LargeHealthPotion], 190, [NopModifier], []],
      [[ChampionHealthPotion], 250, [NopModifier], []],
      [[GiantHealthPotion], 300, [NopModifier], []],
      [[SmallManaPotion], 30, [NopModifier], []],
      [[ManaPotion], 160, [NopModifier], []],
      [[LargeManaPotion], 190, [NopModifier], []],
      [[ChampionManaPotion], 250, [NopModifier], []],
      [[GiantManaPotion], 300, [NopModifier], []],
      [[LeatherBoots], 1, [NopModifier], [...this.commonModifiers, ...this.magicModifiers]],
      [[MetalBoots, PlateBoots], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
      [[LeatherGauntlets], 1, [NopModifier], [...this.commonModifiers, ...this.magicModifiers]],
      [[MetalGauntlets, PlateGauntlets], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], this.commonModifiers],
    ];
    this.debug.log(`Building opposites...`);
    this.opposites = [...this.commonModifiers, ...this.magicModifiers, ...this.magicWeaponModifiers].reduce((acc, mod) => {
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
    this.debug.log(`Building opposites done!`);

    this.debug.log(`Constructing loot...`);
    this.loot = _items.reduce((acc, [items, count, modifiers, modifiers1]) => {
      function* pairs(array: ItemModifierBuilder[]) {
        for (let i = 0; i < array.length; i++) {
          yield [array[i]];
          for (let j = 0; j < array.length; j++) {
            if (i != j) {
              yield [array[i], array[j]];
            }
          }
        }
        yield [];
      }

      for (let i = 0; i < count; i++) {
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

            for (const additionalModifiers of pairs(modifiers1)) {
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
      }
      return acc;
    }, {});
    this.debug.log(`Constructing loot done!`);
  }

  private hasOpposites(arr: ItemModifierBuilder[]): boolean {
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

  private getMinCost(cost: number): number {
    return Math.max(1, Math.round(cost * 0.4));
  }

  public generateLoot(cost: number): Item | null {
    this.debug.log(`Generating loot for ${cost}...`);
    const min = this.getMinCost(cost);
    let roll = Math.ceil(Math.random() * (cost - min)) + min;
    this.debug.log(`Roll: ${roll}`);
    let possibleItems: Item[];
    do {
      this.debug.log(`Finding items for ${roll}...`);
      possibleItems = this.loot[roll];
      roll--;
    } while (roll > 0 && !possibleItems);
    if (possibleItems) {
      const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      this.debug.log(`Generated ${item.getName()}!`);
      return item;
    }
    this.debug.log(`Failed to generate!`);
    return null;
  }

  static getLoot(cost: number) {
    const lootGenerator = new LootGenerator({} as Context);
    const items = lootGenerator['loot'];
    const MIN_COST = lootGenerator.getMinCost(cost);

    // assuming we have every cost
    const loot: Record<string, number> = {};
    for (let i = MIN_COST; i <= cost; i++) {
      const p1 = 1 / (cost - MIN_COST);
      for (const item of items[i]) {
        const p2 = 1 / items[i].length;
        if (!loot[item.getName()]) {
          loot[item.getName()] = 0;
        }
        loot[item.getName()] += p1 * p2;
      }
    }

    return loot;
  }
}

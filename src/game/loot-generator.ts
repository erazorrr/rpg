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
import {AntiWisdom} from "./item-modifiers/anti-wisdom";
import {Wisdom} from "./item-modifiers/wisdom";
import {ChampionWisdom} from "./item-modifiers/champion-wisdom";
import {GiantWisdom} from "./item-modifiers/giant-wisdom";
import {LeviathanWisdom} from "./item-modifiers/leviathan-wisdom";
import {Focus} from "./item-modifiers/focus";
import {ChampionFocus} from "./item-modifiers/champion-focus";
import {GiantFocus} from "./item-modifiers/giant-focus";
import {Power} from "./item-modifiers/power";
import {ChampionPower} from "./item-modifiers/champion-power";
import {GiantPower} from "./item-modifiers/giant-power";
import {Robe} from "./items/chest/robe";
import {Staff} from "./items/weapons/staff";
import {Wand} from "./items/weapons/wand";
import {BloodSacrificeScroll} from "./items/scrolls/blood-sacrifice.scroll";
import {EmpowerScroll} from "./items/scrolls/empower.scroll";
import {FortifyScroll} from "./items/scrolls/fortify.scroll";
import {IceShardScroll} from "./items/scrolls/ice-shard.scroll";
import {FireLanceScroll} from "./items/scrolls/fire-lance.scroll";
import {FreezeScroll} from "./items/scrolls/freeze.scroll";
import {HealScroll} from "./items/scrolls/heal.scroll";
import {IceRayScroll} from "./items/scrolls/ice-ray.scroll";
import {HpPerHit} from "./item-modifiers/hp-per-hit";
import {MpPerHitReceived} from "./item-modifiers/mp-per-hit-received";
import {Potion} from "./items/potions/potion";
import {Bow} from "./items/weapons/bow";
import {Crossbow} from "./items/weapons/crossbow";
import {DexterityPotion} from "./items/potions/dexterity";
import {ChampionDexterityPotion} from "./items/potions/champion-dexterity";
import {CatGraceScroll} from "./items/scrolls/cat-grace.scroll";

type ItemModifierBuilder = new () => ItemModifier;

export class LootGenerator extends GameObject {
  private debug: Debug = new Debug('loot-generator.log');
  private readonly commonModifiers: ItemModifierBuilder[];
  private readonly dexModifiers: ItemModifierBuilder[];
  private readonly endModifiers: ItemModifierBuilder[];
  private readonly magicModifiers: ItemModifierBuilder[];
  private readonly magicWeaponModifiers: ItemModifierBuilder[];
  private opposites: Map<ItemModifierBuilder, Set<ItemModifierBuilder>>;
  private readonly loot: Record<number, Array<Item>>;

  constructor(context: Context) {
    super(context);

    this.commonModifiers = [
      Strength,
      AntiEndurance, AntiDexterity, AntiStrength, AntiHealth,
      ChampionStrength,
      GiantStrength,
      LeviathanStrength,
      AntiWisdom,
    ];
    this.endModifiers = [
      GiantHealth, GiantEndurance, Health, Endurance,
      ChampionEndurance, ChampionHealth,  LeviathanEndurance,
    ];
    this.dexModifiers = [
      Dexterity, GiantDexterity, ChampionDexterity,
    ];
    this.magicModifiers = [
      Wisdom, ChampionWisdom, GiantWisdom, LeviathanWisdom,
    ];
    this.magicWeaponModifiers = [
      Focus, ChampionFocus, GiantFocus,
      Power, ChampionPower, GiantPower,
    ];
    const _items: Array<[Array<new (ctx: Context) => Item>, number, ItemModifierBuilder[], ItemModifierBuilder[]]> = [
      [[ShortSword, HandAxe, GreatAxe, LongSword], 1, [CopperModifier, IronModifier, SteelModifier], [...this.commonModifiers, ...this.endModifiers, HpPerHit]],
      [[Bow, Crossbow], 2, [NopModifier], [...this.commonModifiers, ...this.dexModifiers]],
      [[LeatherArmor], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers]],
      [[Robe], 8, [NopModifier], [...this.magicModifiers, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth, MpPerHitReceived]],
      [[Staff, Wand], 10, [NopModifier], [...this.magicModifiers, ...this.magicWeaponModifiers]],
      [[ChainMail, PlateMail], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.commonModifiers, ...this.endModifiers]],
      [[StrengthPotion, ArmorPotion, DexterityPotion], 50, [NopModifier], []],
      [[ChampionArmorPotion, ChampionStrengthPotion, ChampionDexterityPotion], 150, [NopModifier], []],
      [[LeatherBoots], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers, ...this.magicModifiers]],
      [[MetalBoots, PlateBoots], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.commonModifiers, ...this.endModifiers]],
      [[LeatherGauntlets], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers, ...this.magicModifiers]],
      [[MetalGauntlets, PlateGauntlets], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.commonModifiers, ...this.endModifiers]],
      [[
        BloodSacrificeScroll,
        EmpowerScroll,
        // FireBoltScroll,
        FireLanceScroll,
        FortifyScroll,
        FreezeScroll,
        HealScroll,
        IceRayScroll,
        IceShardScroll,
        // MinorHealScroll,
        CatGraceScroll,
      ], 30, [NopModifier], []],
    ];
    this.debug.log(`Building opposites...`);
    this.opposites = [...this.commonModifiers, ...this.magicModifiers, ...this.magicWeaponModifiers, ...this.dexModifiers, ...this.endModifiers].reduce((acc, mod) => {
      acc.set(mod, new Set());
      const instance = new mod();
      for (const otherMod of [...this.commonModifiers, ...this.magicModifiers, ...this.magicWeaponModifiers, ...this.dexModifiers, ...this.endModifiers]) {
        for (const [key, value] of Object.entries(new otherMod().stats)) {
          if (value && instance.stats[key] && instance.stats[key] !== 0 && mod !== otherMod) {
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

  private HEALTH_POTION_PROBABILITY = 0.20;
  private MANA_POTION_PROBABILITY = 0.20;
  private healthPotions = [SmallHealthPotion, HealthPotion, LargeHealthPotion, ChampionHealthPotion, GiantHealthPotion]
    .map(p => new p(this.context))
    .reduce((acc, p) => {
      const cost = p.getCost();
      if (!acc[cost]) {
        acc[cost] = [];
      }
      acc[cost].push(p);
      return acc;
    }, {} as Record<number, Potion[]>);
  private manaPotions = [SmallManaPotion, ManaPotion, LargeManaPotion, ChampionManaPotion, GiantManaPotion]
    .map(p => new p(this.context))
    .reduce((acc, p) => {
      const cost = p.getCost();
      if (!acc[cost]) {
        acc[cost] = [];
      }
      acc[cost].push(p);
      return acc;
    }, {} as Record<number, Potion[]>);
  public generateLoot(cost: number): Item | null {
    this.debug.log(`Generating loot for ${cost}...`);
    let roll: number;

    let lookUp = this.loot;
    let possibleItems: Item[];
    const potionsRoll = Math.random();
    if (potionsRoll < this.HEALTH_POTION_PROBABILITY) {
      // health potion
      lookUp = this.healthPotions;
      roll = Math.round(cost);
    } else if (potionsRoll < (this.HEALTH_POTION_PROBABILITY + this.MANA_POTION_PROBABILITY)) {
      // mana potion
      lookUp = this.manaPotions;
      roll = Math.round(cost);
    } else {
      const min = this.getMinCost(cost);
      roll = Math.ceil(Math.random() * (cost - min)) + min;
    }
    this.debug.log(`Roll: ${roll}`);
    do {
      this.debug.log(`Finding items for ${roll}...`);
      possibleItems = lookUp[roll];
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
    loot['Health potion'] = lootGenerator['HEALTH_POTION_PROBABILITY'];
    loot['Mana potion'] = lootGenerator['MANA_POTION_PROBABILITY'];
    for (let i = MIN_COST; i <= cost; i++) {
      const p1 = 1 / (cost - MIN_COST);
      for (const item of (items[i] ?? [])) {
        const p2 = 1 / items[i].length;
        if (!loot[item.getName()]) {
          loot[item.getName()] = 0;
        }
        loot[item.getName()] += p1 * p2 * (1 - lootGenerator['HEALTH_POTION_PROBABILITY'] - lootGenerator['MANA_POTION_PROBABILITY']);
      }
    }

    return loot;
  }
}

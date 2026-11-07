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
import {ChampionHpPerHit} from "./item-modifiers/champion-hp-per-hit";
import {Bracelet} from "./items/gauntlets/bracelet";
import {WisdomPotion} from "./items/potions/wisdom";
import {ChampionWisdomPotion} from "./items/potions/champion-wisdom";
import {ThawPotion} from "./items/potions/thaw";
import {ThawScroll} from "./items/scrolls/thaw.scroll";
import {AntidotePotion} from './items/potions/antidote';
import {PurgePoisonScroll} from './items/scrolls/purge-poison.scroll';
import {VenomousTouchScroll} from './items/scrolls/venomous-touch.scroll';
import {SmokeVeilScroll} from './items/scrolls/smoke-veil.scroll';
import {SteamBurstScroll} from './items/scrolls/steam-burst.scroll';
import {BlinkScroll} from './items/scrolls/blink.scroll';
import {LifeDrainScroll} from './items/scrolls/life-drain.scroll';
import {InvisibilityScroll} from './items/scrolls/invisibility.scroll';
import {BOOK_CONSTRUCTORS} from "./items/books/books";
import {Book} from "./items/books/book";
import {VeyranSurveyMap} from './items/veyran-survey-map';
import {CinderWand} from './items/weapons/cinder-wand';
import {RimeWand} from './items/weapons/rime-wand';
import {SerpentWand} from './items/weapons/serpent-wand';
import {RecurveBow} from './items/weapons/recurve-bow';
import {Sling} from './items/weapons/sling';
import {Arbalest} from './items/weapons/arbalest';
import {CompositeBow} from './items/weapons/composite-bow';
import {PaddedCoat} from './items/chest/padded-coat';
import {TrailBoots} from './items/boots/trail-boots';
import {ArchersBracers} from './items/gauntlets/archers-bracers';
import {ChampionAntiStrength} from './item-modifiers/champion-anti-strength';
import {ChampionAntiDexterity} from './item-modifiers/champion-anti-dexterity';
import {ChampionAntiEndurance} from './item-modifiers/champion-anti-endurance';
import {ChampionAntiWisdom} from './item-modifiers/champion-anti-wisdom';
import {ChampionAntiHealth} from './item-modifiers/champion-anti-health';

type ItemModifierBuilder = new () => ItemModifier;

export class LootGenerator extends GameObject {
  private static readonly BOOK_DROP_PROBABILITY = 0.005;
  private static readonly MAP_DROP_PROBABILITY = 0.01;
  private debug: Debug = new Debug('loot-generator.log');
  private readonly commonModifiers: ItemModifierBuilder[];
  private readonly strModifiers: ItemModifierBuilder[];
  private readonly dexModifiers: ItemModifierBuilder[];
  private readonly endModifiers: ItemModifierBuilder[];
  private readonly magicModifiers: ItemModifierBuilder[];
  private readonly magicWeaponModifiers: ItemModifierBuilder[];
  private readonly championAntiModifiers: ItemModifierBuilder[];
  private readonly highTierPositiveModifiers: Set<ItemModifierBuilder>;
  private opposites: Map<ItemModifierBuilder, Set<ItemModifierBuilder>>;
  private readonly loot: Record<number, Array<Item>>;

  private readonly modifierTiers: ReadonlyMap<string, number> = new Map([
    ['copper-weapon', 1], ['copper-armor', 1],
    ['iron-weapon', 2], ['iron-armor', 2],
    ['steel-weapon', 3], ['steel-armor', 3],
    ['champion-strength', 2], ['champion-dexterity', 2], ['champion-endurance', 2],
    ['champion-health', 2], ['champion-wisdom', 2], ['champion-focus', 2], ['champion-power', 2],
    ['champion-hp-per-hit', 2],
    ['champion-anti-strength', 2], ['champion-anti-dexterity', 2], ['champion-anti-endurance', 2],
    ['champion-anti-health', 2], ['champion-anti-wisdom', 2],
    ['giant-strength', 3], ['giant-dexterity', 3], ['giant-endurance', 3],
    ['giant-health', 3], ['giant-wisdom', 3], ['giant-focus', 3], ['giant-power', 3],
    ['leviathan-strength', 4], ['leviathan-endurance', 4], ['leviathan-wisdom', 4],
  ]);

  constructor(context: Context) {
    super(context);

    this.commonModifiers = [
      AntiEndurance, AntiDexterity, AntiStrength, AntiHealth, AntiWisdom,
    ];
    this.strModifiers = [
      Strength,
      ChampionStrength,
      GiantStrength,
      LeviathanStrength,
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
    this.championAntiModifiers = [
      ChampionAntiEndurance,
      ChampionAntiDexterity,
      ChampionAntiStrength,
      ChampionAntiHealth,
      ChampionAntiWisdom,
    ];
    this.highTierPositiveModifiers = new Set([
      ChampionStrength, GiantStrength, LeviathanStrength,
      ChampionDexterity, GiantDexterity,
      ChampionEndurance, GiantEndurance, LeviathanEndurance,
      ChampionHealth, GiantHealth,
      ChampionWisdom, GiantWisdom, LeviathanWisdom,
      ChampionFocus, GiantFocus,
      ChampionPower, GiantPower,
      ChampionHpPerHit,
    ]);
    const _items: Array<[Array<new (ctx: Context) => Item>, number, ItemModifierBuilder[], ItemModifierBuilder[]]> = [
      [[ShortSword, HandAxe, GreatAxe, LongSword], 1, [CopperModifier, IronModifier, SteelModifier], [...this.commonModifiers, ...this.strModifiers, ...this.endModifiers, HpPerHit, ChampionHpPerHit]],
      [[Bow, Crossbow, RecurveBow, Sling, Arbalest, CompositeBow], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers]],
      [[LeatherArmor, PaddedCoat], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers]],
      [[Robe], 8, [NopModifier], [...this.magicModifiers, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth, MpPerHitReceived]],
      [[Staff, Wand, CinderWand, RimeWand, SerpentWand], 10, [NopModifier], [...this.magicModifiers, ...this.magicWeaponModifiers]],
      [[ChainMail, PlateMail], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.strModifiers, ...this.commonModifiers, ...this.endModifiers]],
      [[StrengthPotion, ArmorPotion, DexterityPotion, WisdomPotion, ThawPotion, AntidotePotion], 50, [NopModifier], []],
      [[ChampionArmorPotion, ChampionStrengthPotion, ChampionDexterityPotion, ChampionWisdomPotion], 150, [NopModifier], []],
      [[LeatherBoots, TrailBoots], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers, ...this.magicModifiers]],
      [[MetalBoots, PlateBoots], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.commonModifiers, ...this.strModifiers, ...this.endModifiers]],
      [[LeatherGauntlets, ArchersBracers], 1, [NopModifier], [...this.commonModifiers, ...this.dexModifiers, ...this.magicModifiers]],
      [[Bracelet], 1, [NopModifier], [...this.magicModifiers, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
      [[MetalGauntlets, PlateGauntlets], 1, [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [...this.strModifiers, ...this.commonModifiers, ...this.endModifiers]],
      [[
        BloodSacrificeScroll,
        EmpowerScroll,
        FireLanceScroll,
        FortifyScroll,
        FreezeScroll,
        HealScroll,
        IceRayScroll,
        IceShardScroll,
        CatGraceScroll,
        ThawScroll,
        SmokeVeilScroll,
        SteamBurstScroll,
        BlinkScroll,
        LifeDrainScroll,
        InvisibilityScroll,
        PurgePoisonScroll,
        VenomousTouchScroll,
      ], 30, [NopModifier], []],
    ];
    this.debug.log(`Building opposites...`);
    const allModifiers = [
      ...this.commonModifiers,
      ...this.championAntiModifiers,
      ...this.magicModifiers,
      ...this.magicWeaponModifiers,
      ...this.dexModifiers,
      ...this.endModifiers,
      ...this.strModifiers,
    ];
    this.opposites = allModifiers.reduce((acc, mod) => {
      acc.set(mod, new Set());
      const instance = new mod();
      for (const otherMod of allModifiers) {
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

            for (const additionalModifiers of this.modifierCombinations(modifiers1)) {
              if (this.hasOpposites(additionalModifiers)) {
                continue;
              }

              const res1 = res.clone();
              for (const modifier1 of additionalModifiers) {
                res1.applyModifier(new modifier1());
              }
              const cost1 = res1.getCost();
              if (cost1 <= 0) {
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

  private *modifierCombinations(array: ItemModifierBuilder[]): Generator<ItemModifierBuilder[]> {
    for (let i = 0; i < array.length; i++) {
      yield [array[i]];
      for (let j = 0; j < array.length; j++) {
        if (
          i !== j &&
          !(this.highTierPositiveModifiers.has(array[i]) && this.highTierPositiveModifiers.has(array[j]))
        ) {
          yield [array[i], array[j]];
        }
      }
    }
    yield [];

    for (const positive of array) {
      if (!this.highTierPositiveModifiers.has(positive)) {
        continue;
      }
      for (const drawback of this.championAntiModifiers) {
        yield [positive, drawback];
      }
    }
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
  private books = BOOK_CONSTRUCTORS.map(BookConstructor => new BookConstructor(this.context));
  public generateTreasurePrize(
    cost: number,
    generatedUniqueBookIds: ReadonlySet<string> = new Set(),
    depth = 3,
  ): Item | null {
    return this.generateLootWithPotionPreference(cost * 1.5, generatedUniqueBookIds, false, true, depth, true);
  }

  public generateChestLoot(cost: number, preferPotions: boolean, depth = 3): Item | null {
    return this.generateLootWithPotionPreference(cost, new Set(), preferPotions, false, depth, false);
  }

  public generateLoot(
    cost: number,
    generatedUniqueBookIds: ReadonlySet<string> = new Set(),
    depth = 3,
  ): Item | null {
    return this.generateLootWithPotionPreference(cost, generatedUniqueBookIds, true, true, depth, false);
  }

  private itemFitsDepth(item: Item, depth: number, allowLegendaryModifiers: boolean): boolean {
    const maximumTier = Math.max(1, Math.min(depth, 3));
    return item.getModifiers().every(modifier => {
      const tier = this.modifierTiers.get(modifier.saveId) ?? 1;
      return tier <= maximumTier || allowLegendaryModifiers && depth >= 3 && tier === 4;
    });
  }

  private generateLootWithPotionPreference(
    cost: number,
    generatedUniqueBookIds: ReadonlySet<string>,
    preferPotions: boolean,
    allowRareDrops: boolean,
    depth: number,
    allowLegendaryModifiers: boolean,
  ): Item | null {
    this.debug.log(`Generating loot for ${cost}...`);
    if (cost <= 0) {
      this.debug.log(`Skipping loot for non-positive cost.`);
      return null;
    }
    if (allowRareDrops && Math.random() < LootGenerator.BOOK_DROP_PROBABILITY) {
      const availableBooks = this.books.filter(
        (book: Book) => !book.isUnique || !generatedUniqueBookIds.has(book.saveId),
      );
      const book = availableBooks[Math.floor(Math.random() * availableBooks.length)];
      this.debug.log(`Generated rare book ${book.getName()}!`);
      return book.clone();
    }
    if (allowRareDrops && Math.random() < LootGenerator.MAP_DROP_PROBABILITY) {
      const map = new VeyranSurveyMap(this.context);
      this.debug.log(`Generated rare ${map.getName()}!`);
      return map;
    }
    let roll: number;

    let lookUp = this.loot;
    let possibleItems: Item[];
    const potionsRoll = preferPotions ? Math.random() : 1;
    const player = preferPotions ? this.context.getPlayer() : null;
    let manaPotionsCount = 0;
    if (player) {
      for (const item of player.inventory) {
        if (item.stats.consumableMpReplenish) {
          manaPotionsCount++;
        }
      }
    }
    const playerWisdom = player?.getWisdom(false) ?? 0;
    const playerDexterity = player?.getDexterity(false) ?? 0;
    const playerStrength = player?.getStrength(false) ?? 0;
    let healthProbability = 0;
    if (playerStrength > playerWisdom && playerStrength > playerDexterity) {
      healthProbability = this.HEALTH_POTION_PROBABILITY;
      if (player.hp / player.getMaxHp() < 0.33) {
        healthProbability = 0.8;
      }
    } else if (preferPotions) {
      healthProbability = this.HEALTH_POTION_PROBABILITY;
    }
    let manaProbability = 0;
    if (playerWisdom > playerStrength && playerWisdom > playerDexterity) {
      manaProbability = this.MANA_POTION_PROBABILITY;
      if (player.mp / player.getMaxMp() < 0.25) {
        if (manaPotionsCount === 0) {
          manaProbability = 0.8; healthProbability = 0;
        } else if (manaPotionsCount === 1) {
          manaProbability = 0.5;
        }
      }
    } else if (preferPotions) {
      manaProbability = this.MANA_POTION_PROBABILITY;
    }
    if (potionsRoll < healthProbability) {
      // health potion
      lookUp = this.healthPotions;
      roll = Math.round(cost);
    } else if (potionsRoll < healthProbability + manaProbability) {
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
      possibleItems = lookUp[roll]?.filter(item =>
        (preferPotions || !(item instanceof Potion)) &&
        (lookUp !== this.loot || this.itemFitsDepth(item, depth, allowLegendaryModifiers)),
      );
      roll--;
    } while (roll > 0 && (!possibleItems || possibleItems.length === 0));
    if (possibleItems) {
      const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      this.debug.log(`Generated ${item.getName()}!`);
      return item;
    }
    this.debug.log(`Failed to generate!`);
    return null;
  }

  static getLoot(cost: number, depth = 3) {
    const lootGenerator = new LootGenerator({} as Context);
    const items = lootGenerator['loot'];
    const MIN_COST = lootGenerator.getMinCost(cost);

    // assuming we have every cost
    const loot: Record<string, number> = {};
    loot['Health potion'] = lootGenerator['HEALTH_POTION_PROBABILITY'];
    loot['Mana potion'] = lootGenerator['MANA_POTION_PROBABILITY'];
    for (let i = MIN_COST; i <= cost; i++) {
      const p1 = 1 / (cost - MIN_COST);
      for (const item of (items[i] ?? []).filter(item => lootGenerator.itemFitsDepth(item, depth, false))) {
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

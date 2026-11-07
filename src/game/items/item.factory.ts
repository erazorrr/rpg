import {Context} from "../context";
import {Item} from "../item";
import {restoreItemModifier} from "../item-modifiers/item-modifier.factory";
import {ItemSave} from "../save-data";
import {Bow} from "./weapons/bow";
import {Crossbow} from "./weapons/crossbow";
import {GreatAxe} from "./weapons/great-axe";
import {HandAxe} from "./weapons/hand-axe";
import {LongSword} from "./weapons/long-sword";
import {ShortSword} from "./weapons/short-sword";
import {Staff} from "./weapons/staff";
import {Wand} from "./weapons/wand";
import {ChainMail} from "./chest/chain-mail";
import {LeatherArmor} from "./chest/leather-armor";
import {PlateMail} from "./chest/plate-mail";
import {Robe} from "./chest/robe";
import {LeatherBoots} from "./boots/leather-boots";
import {MetalBoots} from "./boots/metal-boots";
import {PlateBoots} from "./boots/plate-boots";
import {Bracelet} from "./gauntlets/bracelet";
import {LeatherGauntlets} from "./gauntlets/leather-gauntlets";
import {MetalGauntlets} from "./gauntlets/metal-gauntlets";
import {PlateGauntlets} from "./gauntlets/plate-gauntlets";
import {ArmorPotion} from "./potions/armor";
import {ChampionArmorPotion} from "./potions/champion-armor";
import {ChampionDexterityPotion} from "./potions/champion-dexterity";
import {ChampionHealthPotion} from "./potions/champion-health";
import {ChampionManaPotion} from "./potions/champion-mana";
import {ChampionStrengthPotion} from "./potions/champion-strength";
import {ChampionWisdomPotion} from "./potions/champion-wisdom";
import {DexterityPotion} from "./potions/dexterity";
import {GiantHealthPotion} from "./potions/giant-health";
import {GiantManaPotion} from "./potions/giant-mana";
import {HealthPotion} from "./potions/health";
import {LargeHealthPotion} from "./potions/large-health";
import {LargeManaPotion} from "./potions/large-mana";
import {ManaPotion} from "./potions/mana";
import {SmallHealthPotion} from "./potions/small-health";
import {SmallManaPotion} from "./potions/small-mana";
import {StrengthPotion} from "./potions/strength";
import {WisdomPotion} from "./potions/wisdom";
import {ThawPotion} from "./potions/thaw";
import {BloodSacrificeScroll} from "./scrolls/blood-sacrifice.scroll";
import {CatGraceScroll} from "./scrolls/cat-grace.scroll";
import {EmpowerScroll} from "./scrolls/empower.scroll";
import {FireBoltScroll} from "./scrolls/fire-bolt.scroll";
import {FireLanceScroll} from "./scrolls/fire-lance.scroll";
import {FortifyScroll} from "./scrolls/fortify.scroll";
import {FreezeScroll} from "./scrolls/freeze.scroll";
import {HealScroll} from "./scrolls/heal.scroll";
import {IceRayScroll} from "./scrolls/ice-ray.scroll";
import {IceShardScroll} from "./scrolls/ice-shard.scroll";
import {MinorHealScroll} from "./scrolls/minor-heal.scroll";
import {ThawScroll} from "./scrolls/thaw.scroll";
import {SmokeVeilScroll} from './scrolls/smoke-veil.scroll';
import {SteamBurstScroll} from './scrolls/steam-burst.scroll';
import {BlinkScroll} from './scrolls/blink.scroll';
import {LifeDrainScroll} from './scrolls/life-drain.scroll';
import {AntidotePotion} from './potions/antidote';
import {PurgePoisonScroll} from './scrolls/purge-poison.scroll';
import {VenomousTouchScroll} from './scrolls/venomous-touch.scroll';
import {BOOK_CONSTRUCTORS} from "./books/books";
import {LightGoesFirstBook} from "./books/light-goes-first";
import {VeyranSurveyMap} from './veyran-survey-map';
import {CinderWand} from './weapons/cinder-wand';
import {RimeWand} from './weapons/rime-wand';
import {SerpentWand} from './weapons/serpent-wand';
import {RecurveBow} from './weapons/recurve-bow';
import {Sling} from './weapons/sling';
import {Arbalest} from './weapons/arbalest';
import {CompositeBow} from './weapons/composite-bow';
import {PaddedCoat} from './chest/padded-coat';
import {TrailBoots} from './boots/trail-boots';
import {ArchersBracers} from './gauntlets/archers-bracers';
import {InvisibilityScroll} from './scrolls/invisibility.scroll';

type ItemConstructor = (new (context: Context) => Item) & {readonly saveId: string};

const itemConstructors: ItemConstructor[] = [
  ShortSword, LongSword, HandAxe, GreatAxe,
  Bow, Crossbow, RecurveBow, Sling, Arbalest, CompositeBow, Staff,
  Wand, CinderWand, RimeWand, SerpentWand,
  LeatherArmor, PaddedCoat, ChainMail, PlateMail, Robe,
  LeatherBoots, TrailBoots, MetalBoots, PlateBoots,
  LeatherGauntlets, ArchersBracers, MetalGauntlets, PlateGauntlets, Bracelet,
  ArmorPotion, ChampionArmorPotion, ChampionDexterityPotion,
  ChampionHealthPotion, ChampionManaPotion, ChampionStrengthPotion,
  ChampionWisdomPotion, DexterityPotion, GiantHealthPotion, GiantManaPotion,
  HealthPotion, LargeHealthPotion, LargeManaPotion, ManaPotion,
  AntidotePotion, SmallHealthPotion, SmallManaPotion, StrengthPotion, ThawPotion, WisdomPotion,
  BloodSacrificeScroll, CatGraceScroll, EmpowerScroll, FireBoltScroll,
  FireLanceScroll, FortifyScroll, FreezeScroll, HealScroll, IceRayScroll,
  IceShardScroll, MinorHealScroll, ThawScroll,
  SmokeVeilScroll, SteamBurstScroll, BlinkScroll, LifeDrainScroll, PurgePoisonScroll, VenomousTouchScroll,
  InvisibilityScroll,
  LightGoesFirstBook,
  ...BOOK_CONSTRUCTORS,
  VeyranSurveyMap,
];

const constructors = Object.fromEntries(
  itemConstructors.map(Constructor => [Constructor.saveId, Constructor]),
) as Record<string, ItemConstructor>;

export const knownItemSaveIds = new Set(Object.keys(constructors));

export function restoreItem(context: Context, data: ItemSave): Item {
  const Constructor = constructors[data.kind];
  if (!Constructor) throw new Error(`Unknown item: ${data.kind}`);

  const item = new Constructor(context);
  for (const modifierId of data.modifiers) {
    item.applyModifier(restoreItemModifier(modifierId));
  }
  return item;
}

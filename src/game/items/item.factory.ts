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

type ItemConstructor = (new (context: Context) => Item) & {readonly saveId: string};

const itemConstructors: ItemConstructor[] = [
  ShortSword, LongSword, HandAxe, GreatAxe, Bow, Crossbow, Staff, Wand,
  LeatherArmor, ChainMail, PlateMail, Robe,
  LeatherBoots, MetalBoots, PlateBoots,
  LeatherGauntlets, MetalGauntlets, PlateGauntlets, Bracelet,
  ArmorPotion, ChampionArmorPotion, ChampionDexterityPotion,
  ChampionHealthPotion, ChampionManaPotion, ChampionStrengthPotion,
  ChampionWisdomPotion, DexterityPotion, GiantHealthPotion, GiantManaPotion,
  HealthPotion, LargeHealthPotion, LargeManaPotion, ManaPotion,
  SmallHealthPotion, SmallManaPotion, StrengthPotion, WisdomPotion,
  BloodSacrificeScroll, CatGraceScroll, EmpowerScroll, FireBoltScroll,
  FireLanceScroll, FortifyScroll, FreezeScroll, HealScroll, IceRayScroll,
  IceShardScroll, MinorHealScroll,
];

const constructors = Object.fromEntries(
  itemConstructors.map(Constructor => [Constructor.saveId, Constructor]),
) as Record<string, ItemConstructor>;

export function restoreItem(context: Context, data: ItemSave): Item {
  const Constructor = constructors[data.kind];
  if (!Constructor) throw new Error(`Unknown item: ${data.kind}`);

  const item = new Constructor(context);
  for (const modifierId of data.modifiers) {
    item.applyModifier(restoreItemModifier(modifierId));
  }
  return item;
}

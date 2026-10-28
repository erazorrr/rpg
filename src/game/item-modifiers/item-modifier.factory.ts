import {ItemModifier} from "../item-modifier";
import {AntiDexterity} from "./anti-dexterity";
import {AntiEndurance} from "./anti-endurance";
import {AntiHealth} from "./anti-health";
import {AntiStrength} from "./anti-strength";
import {AntiWisdom} from "./anti-wisdom";
import {CopperArmorModifier} from "./armor/material/copper";
import {IronArmorModifier} from "./armor/material/iron";
import {SteelArmorModifier} from "./armor/material/steel";
import {ChampionDexterity} from "./champion-dexterity";
import {ChampionEndurance} from "./champion-endurance";
import {ChampionFocus} from "./champion-focus";
import {ChampionHealth} from "./champion-health";
import {ChampionHpPerHit} from "./champion-hp-per-hit";
import {ChampionPower} from "./champion-power";
import {ChampionStrength} from "./champion-strength";
import {ChampionWisdom} from "./champion-wisdom";
import {Dexterity} from "./dexterity";
import {Endurance} from "./endurance";
import {Focus} from "./focus";
import {GiantDexterity} from "./giant-dexterity";
import {GiantEndurance} from "./giant-endurance";
import {GiantFocus} from "./giant-focus";
import {GiantHealth} from "./giant-health";
import {GiantPower} from "./giant-power";
import {GiantStrength} from "./giant-strength";
import {GiantWisdom} from "./giant-wisdom";
import {Health} from "./health";
import {HpPerHit} from "./hp-per-hit";
import {LeviathanEndurance} from "./leviathan-endurance";
import {LeviathanStrength} from "./leviathan-strength";
import {LeviathanWisdom} from "./leviathan-wisdom";
import {MpPerHitReceived} from "./mp-per-hit-received";
import {NopModifier} from "./nop";
import {Power} from "./power";
import {Strength} from "./strength";
import {CopperModifier} from "./weapon/material/copper";
import {IronModifier} from "./weapon/material/iron";
import {SteelModifier} from "./weapon/material/steel";
import {Wisdom} from "./wisdom";

type ItemModifierConstructor = (new () => ItemModifier) & {readonly saveId: string};

const modifierConstructors: ItemModifierConstructor[] = [
  AntiDexterity,
  AntiEndurance,
  AntiHealth,
  AntiStrength,
  AntiWisdom,
  CopperArmorModifier,
  IronArmorModifier,
  SteelArmorModifier,
  ChampionDexterity,
  ChampionEndurance,
  ChampionFocus,
  ChampionHealth,
  ChampionHpPerHit,
  ChampionPower,
  ChampionStrength,
  ChampionWisdom,
  Dexterity,
  Endurance,
  Focus,
  GiantDexterity,
  GiantEndurance,
  GiantFocus,
  GiantHealth,
  GiantPower,
  GiantStrength,
  GiantWisdom,
  Health,
  HpPerHit,
  LeviathanEndurance,
  LeviathanStrength,
  LeviathanWisdom,
  MpPerHitReceived,
  NopModifier,
  Power,
  Strength,
  CopperModifier,
  IronModifier,
  SteelModifier,
  Wisdom,
];

const constructors = new Map<string, ItemModifierConstructor>();
for (const Constructor of modifierConstructors) {
  if (constructors.has(Constructor.saveId)) {
    throw new Error(`Duplicate item modifier save ID: ${Constructor.saveId}`);
  }
  constructors.set(Constructor.saveId, Constructor);
}

export function restoreItemModifier(saveId: string): ItemModifier {
  const Constructor = constructors.get(saveId);
  if (!Constructor) throw new Error(`Unknown item modifier: ${saveId}`);
  return new Constructor();
}

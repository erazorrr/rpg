import {Spell} from "../spell";
import {BloodSacrificeSpell} from "./blood-sacrifice";
import {CatGraceSpell} from "./cat-grace";
import {EmpowerOtherSpell} from "./empower-other";
import {EmpowerSpell} from "./empower";
import {FireBoltSpell} from "./fire-bolt";
import {FireLanceSpell} from "./fire-lance";
import {FortifyOtherSpell} from "./fortify-other";
import {FortifySpell} from "./fortify";
import {FreezeSpell} from "./freeze";
import {HealSpell} from "./heal";
import {IceRaySpell} from "./ice-ray";
import {IceShardSpell} from "./ice-shard";
import {MinorHealSpell} from "./minor-heal";

type SpellConstructor = (new () => Spell) & {readonly saveId: string};

const spellConstructors: SpellConstructor[] = [
  BloodSacrificeSpell,
  CatGraceSpell,
  EmpowerOtherSpell,
  EmpowerSpell,
  FireBoltSpell,
  FireLanceSpell,
  FortifyOtherSpell,
  FortifySpell,
  FreezeSpell,
  HealSpell,
  IceRaySpell,
  IceShardSpell,
  MinorHealSpell,
];

const constructors = new Map<string, SpellConstructor>();
for (const Constructor of spellConstructors) {
  if (constructors.has(Constructor.saveId)) {
    throw new Error(`Duplicate spell save ID: ${Constructor.saveId}`);
  }
  constructors.set(Constructor.saveId, Constructor);
}

export function restoreSpell(saveId: string): Spell {
  const Constructor = constructors.get(saveId);
  if (!Constructor) throw new Error(`Unknown spell: ${saveId}`);
  return new Constructor();
}

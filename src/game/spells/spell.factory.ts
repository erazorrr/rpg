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
import {ThawSpell} from "./thaw";
import {SmokeVeilSpell} from './smoke-veil';
import {SteamBurstSpell} from './steam-burst';
import {BlinkSpell} from './blink';
import {LifeDrainSpell} from './life-drain';
import {PurgePoisonSpell} from './purge-poison';
import {VenomousTouchSpell} from './venomous-touch';
import {InvisibilitySpell} from './invisibility';

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
  ThawSpell,
  SmokeVeilSpell,
  SteamBurstSpell,
  BlinkSpell,
  LifeDrainSpell,
  PurgePoisonSpell,
  VenomousTouchSpell,
  InvisibilitySpell,
];

const constructors = new Map<string, SpellConstructor>();
const keyBindings = new Map<string, SpellConstructor>();
for (const Constructor of spellConstructors) {
  if (constructors.has(Constructor.saveId)) {
    throw new Error(`Duplicate spell save ID: ${Constructor.saveId}`);
  }
  const {keyBinding} = new Constructor();
  if (!/^[a-zA-Z]$/.test(keyBinding)) {
    throw new Error(`Invalid key binding for spell ${Constructor.saveId}: ${keyBinding}`);
  }
  if (keyBindings.has(keyBinding)) {
    throw new Error(`Duplicate spell key binding: ${keyBinding}`);
  }
  constructors.set(Constructor.saveId, Constructor);
  keyBindings.set(keyBinding, Constructor);
}

export const knownSpellSaveIds = new Set(constructors.keys());

export function restoreSpell(saveId: string): Spell {
  const Constructor = constructors.get(saveId);
  if (!Constructor) throw new Error(`Unknown spell: ${saveId}`);
  return new Constructor();
}

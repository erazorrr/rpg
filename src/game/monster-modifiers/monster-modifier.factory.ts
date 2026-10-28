import {MonsterModifier} from "../monster-modifier";
import {DexterityMonsterModifier} from "./dexterity";
import {EnduranceMonsterModifier} from "./endurance";
import {SpectralHitMonsterModifier} from "./spectral-hit";
import {StrengthMonsterModifier} from "./strength";
import {WisdomMonsterModifier} from "./wisdom";

type MonsterModifierConstructor = (new () => MonsterModifier) & {readonly saveId: string};

const modifierConstructors: MonsterModifierConstructor[] = [
  DexterityMonsterModifier,
  EnduranceMonsterModifier,
  SpectralHitMonsterModifier,
  StrengthMonsterModifier,
  WisdomMonsterModifier,
];

const constructors = new Map<string, MonsterModifierConstructor>();
for (const Constructor of modifierConstructors) {
  if (constructors.has(Constructor.saveId)) {
    throw new Error(`Duplicate monster modifier save ID: ${Constructor.saveId}`);
  }
  constructors.set(Constructor.saveId, Constructor);
}

export function restoreMonsterModifier(saveId: string): MonsterModifier {
  const Constructor = constructors.get(saveId);
  if (!Constructor) throw new Error(`Unknown monster modifier: ${saveId}`);
  return new Constructor();
}

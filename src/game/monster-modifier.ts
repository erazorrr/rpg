import {ModifierStats} from "./item-modifier";

export type MonsterModifierStats = {
  strength?: number;
  dexterity?: number;
  endurance?: number;
};

export abstract class MonsterModifier {
  constructor(public name: string, public stats: MonsterModifierStats, public costMultiplicator: number, public isSuffix: boolean = false) {
  }
}

export type MonsterModifierStats = {
  strength?: number;
  dexterity?: number;
  endurance?: number;
  wisdom?: number;
};

export abstract class MonsterModifier {
  protected constructor(
    public name: string,
    public stats: MonsterModifierStats,
    public costMultiplicator: number,
    public isSuffix: boolean = false) {
  }
}

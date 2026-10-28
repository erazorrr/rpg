export type MonsterModifierStats = {
  strength?: number;
  dexterity?: number;
  endurance?: number;
  wisdom?: number;
};

export abstract class MonsterModifier {
  public get saveId(): string {
    return (this.constructor as typeof MonsterModifier & {readonly saveId: string}).saveId;
  }

  protected constructor(
    public name: string,
    public stats: MonsterModifierStats,
    public costMultiplicator: number,
    public isSuffix: boolean = false) {
  }
}

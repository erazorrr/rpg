import {Spell, SpellTarget} from "../spell";

export class HealSpell extends Spell {
  public static readonly saveId = "heal";
  public readonly keyBinding = 'H';

  constructor() {
    super(SpellTarget.Self, {
      restoreHp: 30,
    }, 3);
  }

  getName(): string {
    return "Heal";
  }

  getMPCost(): number {
    return 30;
  }
}

import {Spell, SpellTarget} from "../spell";

export class MinorHealSpell extends Spell {
  public static readonly saveId = "minor-heal";

  constructor() {
    super(SpellTarget.Self, {
      restoreHp: 10,
    }, 1);
  }

  getName(): string {
    return "Minor Heal";
  }

  getMPCost(): number {
    return 10;
  }
}

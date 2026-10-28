import {Spell, SpellTarget} from "../spell";

export class BloodSacrificeSpell extends Spell {
  public static readonly saveId = "blood-sacrifice";

  constructor() {
    super(SpellTarget.Self, {
      restoreHp: -10,
    }, 1);
  }

  getMPCost(): number {
    return -10;
  }

  getName(): string {
    return "Blood Sacrifice";
  }
}

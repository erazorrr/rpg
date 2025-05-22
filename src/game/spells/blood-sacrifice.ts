import {Spell, SpellTarget} from "../spell";

export class BloodSacrificeSpell extends Spell {
  constructor() {
    super(SpellTarget.Self, {
      restoreHp: -10,
    });
  }

  getMPCost(): number {
    return -10;
  }

  getName(): string {
    return "Blood Sacrifice";
  }
}

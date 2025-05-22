import {Spell, SpellTarget} from "../spell";

export class MinorHealSpell extends Spell {
  constructor() {
    super(SpellTarget.Self, {
      restoreHp: 10,
    });
  }

  getName(): string {
    return "Minor Heal";
  }

  getMPCost(): number {
    return 10;
  }
}

import {Spell, SpellTarget} from "../spell";

export class HealSpell extends Spell {
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

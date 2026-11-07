import {Spell, SpellTarget} from "../spell";
import {ArmorState} from "../states/armor.state";

export class FortifyOtherSpell extends Spell {
  public static readonly saveId = "fortify-other";
  public readonly keyBinding = 'o';

  constructor() {
    super(SpellTarget.Monster, {
      state: () => new ArmorState(30, 15),
    }, 1);
  }

  getMPCost(): number {
    return 10;
  }

  getName(): string {
    return "Fortify";
  }
}

import {Spell, SpellTarget} from '../spell';

export class BlinkSpell extends Spell {
  public static readonly saveId = 'blink';
  public readonly keyBinding = 'B';

  constructor() {
    super(SpellTarget.Self, {teleportRange: 5}, 2);
  }

  public getName(): string { return 'Blink'; }
  public getMPCost(): number { return 8; }
}

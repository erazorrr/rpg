import {Spell, SpellTarget} from '../spell';

export class SmokeVeilSpell extends Spell {
  public static readonly saveId = 'smoke-veil';
  public readonly keyBinding = 'v';
  constructor() {
    super(SpellTarget.Self, {
      atmosphere: {kind: 'smoke', turns: 7, density: 3, shape: 'cross'},
    }, 2);
  }
  public getName(): string { return 'Smoke Veil'; }
  public getMPCost(): number { return 8; }
}

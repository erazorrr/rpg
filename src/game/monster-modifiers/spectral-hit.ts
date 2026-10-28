import {MonsterModifier} from "../monster-modifier";

export class SpectralHitMonsterModifier extends MonsterModifier {
  public static readonly saveId = "spectral-hit";

  constructor() {
    super('Spectral', {}, 3, false);
  }
}

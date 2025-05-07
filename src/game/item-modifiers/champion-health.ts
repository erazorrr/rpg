import {ItemModifier} from "../item-modifier";

export class ChampionHealth extends ItemModifier {
  constructor() {
    super('champion health', {
      maxHp: 10,
    }, 7, true);
  }
}

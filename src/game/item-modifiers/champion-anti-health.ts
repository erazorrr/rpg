import {ItemModifier} from "../item-modifier";

export class ChampionAntiHealth extends ItemModifier {
  constructor() {
    super('champion disease', {
      maxHp: -15,
    }, -2, true);
  }
}

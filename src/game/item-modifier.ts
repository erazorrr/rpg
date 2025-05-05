import {ItemStats} from "./item";

export type ModifierStats = ItemStats;

export class ItemModifier {
  constructor(public name: string, public stats: ModifierStats, public cost: number, public isSuffix: boolean = false) {
  }
}

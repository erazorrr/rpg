import {ItemStats} from "./item";

export type ModifierStats = ItemStats;

export class ItemModifier {
  public get saveId(): string {
    return (this.constructor as typeof ItemModifier & {readonly saveId: string}).saveId;
  }

  constructor(public name: string, public stats: ModifierStats, public cost: number, public isSuffix: boolean = false) {
  }
}

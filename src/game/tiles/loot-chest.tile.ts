import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {Item} from '../item';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

export type LootChestRarity = 'sturdy' | 'reinforced' | 'gilded';

const rarityNames: Record<LootChestRarity, string> = {
  sturdy: 'Sturdy chest',
  reinforced: 'Reinforced chest',
  gilded: 'Gilded chest',
};

const rarityColors: Record<LootChestRarity, ForegroundColor> = {
  sturdy: ForegroundColor.DarkGoldenrod,
  reinforced: ForegroundColor.LightSteelBlue,
  gilded: ForegroundColor.Gold1,
};

export function isLootChestRarity(value: unknown): value is LootChestRarity {
  return value === 'sturdy' || value === 'reinforced' || value === 'gilded';
}

export class LootChestTile extends Tile {
  public static readonly saveId = 'loot-chest';

  constructor(public readonly rarity: LootChestRarity, private items: Item[]) {
    super();
  }

  public getName(): string { return rarityNames[this.rarity]; }

  public getItems(): readonly Item[] { return this.items; }

  public takeItem(index: number): Item | undefined {
    if (index < 0 || index >= this.items.length) return undefined;
    return this.items.splice(index, 1)[0];
  }

  public getBaseChar(): Char {
    return {
      char: 'C',
      color: this.items.length ? rarityColors[this.rarity] : ForegroundColor.Grey53,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }

  public toSaveData(): TileSave {
    return {
      ...super.toSaveData(),
      lootChest: {
        rarity: this.rarity,
        items: this.items.map(item => item.toSaveData()),
      },
    };
  }
}

import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'lashed-planks': 'Rough planks and splintered furniture are lashed into a waist-high barricade.',
  'braced-stakes': 'Sharpened stakes lean outward from a frame braced with loose stones.',
  'stacked-scrap': 'Broken doors, crate boards, and bent iron have been stacked across the way.',
} as const;

export type BarricadeDescriptionId = keyof typeof descriptions;

export class BarricadeTile extends Tile {
  public static readonly saveId = 'barricade';

  constructor(public readonly descriptionId: BarricadeDescriptionId = 'lashed-planks') {
    super();
  }

  public static withRandomDescription(random: () => number): BarricadeTile {
    const ids = Object.keys(descriptions) as BarricadeDescriptionId[];
    return new BarricadeTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is BarricadeDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {
      char: '+',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }

  public getBumpMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), bumpDescriptionId: this.descriptionId};
  }
}

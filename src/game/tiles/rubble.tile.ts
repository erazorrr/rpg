import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'fallen-slabs': 'Slabs of fallen stone lie heaped too high to cross.',
  'broken-masonry': 'Broken masonry and pale dust fill the passage.',
  'jagged-stone': 'Jagged blocks are wedged together from floor to ceiling.',
} as const;

export type RubbleDescriptionId = keyof typeof descriptions;

export class RubbleTile extends Tile {
  public static readonly saveId = 'rubble';

  constructor(public readonly descriptionId: RubbleDescriptionId = 'fallen-slabs') {
    super();
  }

  public static withRandomDescription(random: () => number): RubbleTile {
    const ids = Object.keys(descriptions) as RubbleDescriptionId[];
    return new RubbleTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is RubbleDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {
      char: ':',
      color: ForegroundColor.Grey53,
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

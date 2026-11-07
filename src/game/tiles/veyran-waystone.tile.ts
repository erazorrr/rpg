import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'weathered-grooves': 'Weather-softened grooves cover the face of the upright stone.',
  'cold-stone': 'The waystone holds a deep chill despite the open air around it.',
  'lichen-scent': 'Rain-dark lichen gives the waystone a clean, earthy smell.',
} as const;

export type VeyranWaystoneDescriptionId = keyof typeof descriptions;

export class VeyranWaystoneTile extends Tile {
  public static readonly saveId = 'veyran-waystone';

  constructor(public readonly descriptionId: VeyranWaystoneDescriptionId = 'weathered-grooves') {
    super();
  }

  public static withRandomDescription(random: () => number): VeyranWaystoneTile {
    const ids = Object.keys(descriptions) as VeyranWaystoneDescriptionId[];
    return new VeyranWaystoneTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is VeyranWaystoneDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  getBaseChar(): Char {
    return {
      char: 'I',
      color: ForegroundColor.Grey69,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.SpringGreen2a,
    };
  }

  isNavigable(): boolean {
    return true;
  }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

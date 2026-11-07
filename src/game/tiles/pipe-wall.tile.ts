import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'warm-pipes': 'Warm metal pipes tremble against the fitted stone.',
  condensation: 'Condensation beads on a tangle of pipes and patched joints.',
  'mineral-stains': 'Pale mineral stains spread beneath the seams of the wall pipes.',
} as const;

export type PipeWallDescriptionId = keyof typeof descriptions;

export class PipeWallTile extends Tile {
  public static readonly saveId = 'pipe-wall';

  constructor(public readonly descriptionId: PipeWallDescriptionId = 'warm-pipes') {
    super();
  }

  public static withRandomDescription(random: () => number): PipeWallTile {
    const ids = Object.keys(descriptions) as PipeWallDescriptionId[];
    return new PipeWallTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is PipeWallDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(_frame?: never, position?: Position): Char {
    const joint = ((position?.x ?? 0) + (position?.y ?? 0)) % 7 === 0;
    return {
      char: joint ? 'O' : '#',
      color: joint ? ForegroundColor.SteelBlue : ForegroundColor.DarkGoldenrod,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey11,
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

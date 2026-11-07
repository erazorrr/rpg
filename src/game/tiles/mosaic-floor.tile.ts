import {Position} from '../../io/position';
import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'broken-pattern': 'Blue and gold mosaic stones form a pattern broken by missing pieces.',
  'hollow-click': 'Loose mosaic pieces click hollowly beneath your boots.',
  'dusty-mortar': 'Dry mortar dust rises from the seams of the mosaic floor.',
} as const;

export type MosaicFloorDescriptionId = keyof typeof descriptions;

export class MosaicFloorTile extends Tile {
  public static readonly saveId = 'mosaic-floor';

  constructor(public readonly descriptionId: MosaicFloorDescriptionId = 'broken-pattern') {
    super();
  }

  public static withRandomDescription(random: () => number): MosaicFloorTile {
    const ids = Object.keys(descriptions) as MosaicFloorDescriptionId[];
    return new MosaicFloorTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is MosaicFloorDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(_frame?: never, position?: Position): Char {
    const alternate = ((position?.x ?? 0) + (position?.y ?? 0)) % 2 === 0;
    return {
      char: alternate ? '.' : ',',
      color: alternate ? ForegroundColor.Gold3a : ForegroundColor.SteelBlue,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey23,
    };
  }

  public isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

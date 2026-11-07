import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'plain-stone': 'A plain stone pillar rises into the darkness above.',
  'chisel-scored': 'Shallow chisel marks cross the face of the stone pillar.',
  'soot-stained': 'A broad soot stain darkens one side of the stone pillar.',
} as const;

export type StonePillarDescriptionId = keyof typeof descriptions;

export class StonePillarTile extends Tile {
  public static readonly saveId = 'stone-pillar';

  constructor(public readonly descriptionId: StonePillarDescriptionId = 'plain-stone') {
    super();
  }

  public static withRandomDescription(random: () => number): StonePillarTile {
    const ids = Object.keys(descriptions) as StonePillarDescriptionId[];
    return new StonePillarTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is StonePillarDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {
      char: '|',
      color: ForegroundColor.Grey69,
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

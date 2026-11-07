import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'cold-ash': 'Cold grey ash fills the iron brazier.',
  'charred-wood': 'A few lengths of charred wood remain in the cold brazier.',
  'melted-tallow': 'Melted tallow has hardened around the rim of the cold brazier.',
} as const;

export type DeadBrazierDescriptionId = keyof typeof descriptions;

export class DeadBrazierTile extends Tile {
  public static readonly saveId = 'dead-brazier';

  constructor(public readonly descriptionId: DeadBrazierDescriptionId = 'cold-ash') {
    super();
  }

  public static withRandomDescription(random: () => number): DeadBrazierTile {
    const ids = Object.keys(descriptions) as DeadBrazierDescriptionId[];
    return new DeadBrazierTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is DeadBrazierDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {
      char: 'o',
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

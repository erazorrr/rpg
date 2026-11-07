import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'oily-smoke': 'Oily smoke coils from the brazier and gathers close to the floor.',
  'damp-fuel': 'Damp fuel smoulders in the brazier beneath a lid of grey smoke.',
  'red-coals': 'Red coals pulse beneath the smoke filling the brazier.',
} as const;

export type SmokingBrazierDescriptionId = keyof typeof descriptions;

export class SmokingBrazierTile extends Tile {
  public static readonly saveId = 'smoking-brazier';

  constructor(public readonly descriptionId: SmokingBrazierDescriptionId = 'oily-smoke') {
    super();
  }

  public static withRandomDescription(random: () => number): SmokingBrazierTile {
    const ids = Object.keys(descriptions) as SmokingBrazierDescriptionId[];
    return new SmokingBrazierTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is SmokingBrazierDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {char: 'o', color: ForegroundColor.Grey53, backgroundColor: BackgroundColor.DarkRed1};
  }
  public isNavigable(): boolean { return false; }

  public getBumpMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public getAtmosphereSource() {
    return {period: 5, maxNearby: 4, emission: {kind: 'smoke' as const, turns: 8, density: 3 as const, shape: 'cross' as const}};
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), bumpDescriptionId: this.descriptionId};
  }
}

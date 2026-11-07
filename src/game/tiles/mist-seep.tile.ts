import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'welling-mist': 'Pale mist wells silently from tiny pores in the stone.',
  'clammy-cold': 'Clammy cold settles against your skin above the seep.',
  'wet-earth': 'The mist carries the smell of wet earth from somewhere below.',
} as const;

export type MistSeepDescriptionId = keyof typeof descriptions;

export class MistSeepTile extends Tile {
  public static readonly saveId = 'mist-seep';

  constructor(public readonly descriptionId: MistSeepDescriptionId = 'welling-mist') {
    super();
  }

  public static withRandomDescription(random: () => number): MistSeepTile {
    const ids = Object.keys(descriptions) as MistSeepDescriptionId[];
    return new MistSeepTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is MistSeepDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {char: ';', color: ForegroundColor.DarkSeaGreen, backgroundColor: BackgroundColor.Black};
  }
  public isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public getAtmosphereSource() {
    return {period: 6, maxNearby: 8, emission: {kind: 'fog' as const, turns: 12, density: 2 as const, shape: 'single' as const}};
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

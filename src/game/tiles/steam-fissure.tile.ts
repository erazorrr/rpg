import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';

const descriptions = {
  'warm-vapor': 'Warm vapor beads on your boots beside the narrow fissure.',
  'soft-hiss': 'Steam escapes the crack with a soft, unbroken hiss.',
  'mineral-scent': 'The fissure breathes out a damp mineral smell.',
} as const;

export type SteamFissureDescriptionId = keyof typeof descriptions;

export class SteamFissureTile extends Tile {
  public static readonly saveId = 'steam-fissure';

  constructor(public readonly descriptionId: SteamFissureDescriptionId = 'warm-vapor') {
    super();
  }

  public static withRandomDescription(random: () => number): SteamFissureTile {
    const ids = Object.keys(descriptions) as SteamFissureDescriptionId[];
    return new SteamFissureTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is SteamFissureDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(): Char {
    return {char: '^', color: ForegroundColor.Grey69, backgroundColor: BackgroundColor.Black};
  }
  public isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public getAtmosphereSource() {
    return {period: 5, maxNearby: 5, emission: {kind: 'steam' as const, turns: 4, density: 2 as const, shape: 'cross' as const}};
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

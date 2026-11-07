import {AnimationFrame} from '../animation';
import {Position} from '../../io/position';
import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile, TileLight} from './abstract.tile';

const descriptions = {
  'rising-warmth': 'Steady warmth rises through the iron grate.',
  'hot-iron': 'The air above the grate smells of hot iron and damp stone.',
  'slow-pulse': 'A slow mechanical pulse trembles through the grate beneath your feet.',
} as const;

export type HeatGrateDescriptionId = keyof typeof descriptions;

export class HeatGrateTile extends Tile {
  public static readonly saveId = 'heat-grate';

  constructor(public readonly descriptionId: HeatGrateDescriptionId = 'rising-warmth') {
    super();
  }

  public static withRandomDescription(random: () => number): HeatGrateTile {
    const ids = Object.keys(descriptions) as HeatGrateDescriptionId[];
    return new HeatGrateTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is HeatGrateDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const bright = ((position?.x ?? 0) * 5 + (position?.y ?? 0) * 11 + Math.floor((frame?.frame ?? 0) / 5)) % 2 === 0;
    return {
      char: '%',
      color: bright ? ForegroundColor.Orange1 : ForegroundColor.DarkOrange3a,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public getLight(frame?: AnimationFrame, position?: Position): TileLight {
    const phase = ((position?.x ?? 0) * 5 + (position?.y ?? 0) * 11 + Math.floor((frame?.frame ?? 0) / 8)) % 2;
    return {
      radius: 2,
      innerRadius: phase,
      innerColor: BackgroundColor.Orange4a,
      outerColor: BackgroundColor.DarkRed1,
      bloodyInnerColor: BackgroundColor.Red3a,
      bloodyOuterColor: BackgroundColor.DarkRed1,
    };
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

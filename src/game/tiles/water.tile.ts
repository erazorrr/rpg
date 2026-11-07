import {Tile} from "./abstract.tile";
import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {AnimationFrame} from "../animation";
import {Position} from "../../io/position";
import {TileSave} from '../save-data';

const descriptions = {
  'hidden-bottom': 'The dark water hides the bottom beyond the ledge.',
  'steep-drop': 'The stone drops steeply beneath the water at your feet.',
  'cold-current': 'A cold current folds the black surface over itself.',
} as const;

export type WaterDescriptionId = keyof typeof descriptions;

export class WaterTile extends Tile {
  public static readonly saveId = "water";

  constructor(public readonly descriptionId: WaterDescriptionId = 'hidden-bottom') {
    super();
  }

  public static withRandomDescription(random: () => number): WaterTile {
    const ids = Object.keys(descriptions) as WaterDescriptionId[];
    return new WaterTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is WaterDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const coarseFrame = Math.floor((frame?.frame ?? 0) / 2);
    const phase = ((position?.x ?? 0) * 17 + (position?.y ?? 0) * 31 + coarseFrame) % 5;
    return {
      char: phase === 0 ? '-' : '~',
      color: ForegroundColor.Blue,
      backgroundColor: BackgroundColor.Blue3a,
    };
  }

  isNavigable(): boolean {
    return false;
  }

  public blocksLight(): boolean {
    return false;
  }

  public getBumpMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), bumpDescriptionId: this.descriptionId};
  }
}

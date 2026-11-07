import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {AnimationFrame} from '../animation';
import {Position} from '../../io/position';
import {TileSave} from '../save-data';
import {Tile, TileLight} from './abstract.tile';

const descriptions = {
  'pooled-light': 'Blue-green light pools beneath the translucent mushroom caps.',
  'earthy-scent': 'The mushrooms smell of wet earth and bruised herbs.',
  'cool-caps': 'Cool, rubbery mushroom caps brush against your boots.',
} as const;

export type GlowingMushroomDescriptionId = keyof typeof descriptions;

export class GlowingMushroomTile extends Tile {
  static readonly saveId = 'glowing-mushroom';

  constructor(public readonly descriptionId: GlowingMushroomDescriptionId = 'pooled-light') {
    super();
  }

  public static withRandomDescription(random: () => number): GlowingMushroomTile {
    const ids = Object.keys(descriptions) as GlowingMushroomDescriptionId[];
    return new GlowingMushroomTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is GlowingMushroomDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  getBaseChar(): Char {
    return {
      char: '"',
      color: ForegroundColor.Cyan2,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }
  isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  getLight(frame?: AnimationFrame, position?: Position): TileLight {
    const phase = ((position?.x ?? 0) * 7 + (position?.y ?? 0) * 11 + Math.floor((frame?.frame ?? 0) / 8)) % 2;
    return {
      radius: 3,
      innerRadius: 1 + phase,
      innerColor: BackgroundColor.DarkCyan,
      outerColor: BackgroundColor.DarkGreen,
      bloodyInnerColor: BackgroundColor.Red3a,
      bloodyOuterColor: BackgroundColor.DarkRed1,
    };
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

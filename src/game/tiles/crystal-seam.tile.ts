import {AnimationFrame} from '../animation';
import {Position} from '../../io/position';
import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {TileSave} from '../save-data';
import {Tile, TileLight} from './abstract.tile';

const descriptions = {
  'fine-facets': 'Fine crystal facets glint from a seam beneath your boots.',
  'stone-chill': 'A mineral chill presses through your soles above the crystal seam.',
  'metallic-taste': 'The air above the crystal seam tastes faintly metallic.',
} as const;

export type CrystalSeamDescriptionId = keyof typeof descriptions;

export class CrystalSeamTile extends Tile {
  public static readonly saveId = 'crystal-seam';

  constructor(public readonly descriptionId: CrystalSeamDescriptionId = 'fine-facets') {
    super();
  }

  public static withRandomDescription(random: () => number): CrystalSeamTile {
    const ids = Object.keys(descriptions) as CrystalSeamDescriptionId[];
    return new CrystalSeamTile(ids[Math.floor(random() * ids.length)]);
  }

  public static isDescriptionId(value: unknown): value is CrystalSeamDescriptionId {
    return typeof value === 'string' && value in descriptions;
  }

  public getBaseChar(frame?: AnimationFrame, position?: Position): Char {
    const glint = ((position?.x ?? 0) * 7 + (position?.y ?? 0) * 13 + Math.floor((frame?.frame ?? 0) / 6)) % 3;
    return {
      char: '.',
      color: glint === 0 ? ForegroundColor.LightCyan1 : ForegroundColor.SteelBlue1a,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return true; }

  public getStepMessages(): string[] {
    return [descriptions[this.descriptionId]];
  }

  public getLight(): TileLight {
    return {
      radius: 2,
      innerRadius: 0,
      innerColor: BackgroundColor.DarkBlue,
      outerColor: BackgroundColor.NavyBlue,
      bloodyInnerColor: BackgroundColor.DarkRed1,
      bloodyOuterColor: BackgroundColor.DarkRed1,
    };
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), stepDescriptionId: this.descriptionId};
  }
}

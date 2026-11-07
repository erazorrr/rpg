import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {TileSave} from '../save-data';
import {Tile} from './abstract.tile';
import {StatueInscriptionId, statueInscriptions} from './statue-inscriptions';
import {StatueVariantId, statueVariants} from './statue-variants';

export class StatueTile extends Tile {
  public static readonly saveId = 'statue';

  constructor(
    public readonly inscriptionId: StatueInscriptionId,
    public readonly variantId: StatueVariantId = 'weathered-stone',
  ) {
    super();
  }

  public getBaseChar(): Char {
    return {
      char: '&',
      color: statueVariants[this.variantId].color,
      backgroundColor: this.isBloody ? BackgroundColor.DarkRed1 : BackgroundColor.Grey19,
    };
  }

  public isNavigable(): boolean { return false; }

  public getBumpMessages(): string[] {
    const preset = statueInscriptions[this.inscriptionId];
    const variant = statueVariants[this.variantId];
    return [`${variant.description} ${preset.subject}`, ...preset.lines];
  }

  public toSaveData(): TileSave {
    return {...super.toSaveData(), inscriptionId: this.inscriptionId, statueVariantId: this.variantId};
  }
}

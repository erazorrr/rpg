import {BackgroundColor} from '../../../io/background.color';
import {Char} from '../../../io/char';
import {ForegroundColor} from '../../../io/foreground.color';
import {Context} from '../../context';
import {ItemStats} from '../../item';
import {PoisonedState} from '../../states/poisoned.state';
import {Potion} from './potion';

export class AntidotePotion extends Potion {
  public static readonly saveId = 'antidote-potion';
  private static readonly baseStats: ItemStats = {
    consumableStateRemoval: {
      saveId: PoisonedState.saveId,
      name: 'Poisoned',
    },
  };

  constructor(context: Context) {
    super(context, {...AntidotePotion.baseStats}, 4);
  }

  public getBaseName(): string {
    return 'Antidote';
  }

  public getChar(): Char {
    return {
      char: 'q',
      color: ForegroundColor.GreenYellow,
      backgroundColor: BackgroundColor.Black,
    };
  }
}

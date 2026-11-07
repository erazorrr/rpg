import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {VenomousTouchSpell} from '../../spells/venomous-touch';

export class VenomousTouchScroll extends Scroll {
  public static readonly saveId = 'venomous-touch-scroll';

  constructor(context: Context) {
    super(context, VenomousTouchSpell);
  }
}

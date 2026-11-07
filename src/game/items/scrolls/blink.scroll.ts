import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {BlinkSpell} from '../../spells/blink';

export class BlinkScroll extends Scroll {
  public static readonly saveId = 'blink-scroll';
  constructor(context: Context) { super(context, BlinkSpell); }
}

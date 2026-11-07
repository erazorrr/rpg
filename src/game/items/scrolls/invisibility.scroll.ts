import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {InvisibilitySpell} from '../../spells/invisibility';

export class InvisibilityScroll extends Scroll {
  public static readonly saveId = 'invisibility-scroll';
  constructor(context: Context) { super(context, InvisibilitySpell); }
}

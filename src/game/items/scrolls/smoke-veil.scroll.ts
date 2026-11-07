import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {SmokeVeilSpell} from '../../spells/smoke-veil';

export class SmokeVeilScroll extends Scroll {
  public static readonly saveId = 'smoke-veil-scroll';
  constructor(context: Context) { super(context, SmokeVeilSpell); }
}

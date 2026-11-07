import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {LifeDrainSpell} from '../../spells/life-drain';

export class LifeDrainScroll extends Scroll {
  public static readonly saveId = 'life-drain-scroll';
  constructor(context: Context) { super(context, LifeDrainSpell); }
}

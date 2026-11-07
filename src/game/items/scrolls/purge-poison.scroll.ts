import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {PurgePoisonSpell} from '../../spells/purge-poison';

export class PurgePoisonScroll extends Scroll {
  public static readonly saveId = 'purge-poison-scroll';

  constructor(context: Context) {
    super(context, PurgePoisonSpell);
  }
}

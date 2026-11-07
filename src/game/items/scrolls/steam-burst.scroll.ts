import {Scroll} from '../../abstract.scroll';
import {Context} from '../../context';
import {SteamBurstSpell} from '../../spells/steam-burst';

export class SteamBurstScroll extends Scroll {
  public static readonly saveId = 'steam-burst-scroll';
  constructor(context: Context) { super(context, SteamBurstSpell); }
}

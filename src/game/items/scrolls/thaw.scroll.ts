import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {ThawSpell} from "../../spells/thaw";

export class ThawScroll extends Scroll {
  public static readonly saveId = "thaw-scroll";

  constructor(context: Context) {
    super(context, ThawSpell);
  }
}

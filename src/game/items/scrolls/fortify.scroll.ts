import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FortifySpell} from "../../spells/fortify";

export class FortifyScroll extends Scroll {
  public static readonly saveId = "fortify-scroll";
  constructor(context: Context) {
    super(context, FortifySpell);
  }
}

import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FortifySpell} from "../../spells/fortify";

export class FortifyScroll extends Scroll {
  constructor(context: Context) {
    super(context, FortifySpell);
  }
}

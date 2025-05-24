import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FreezeSpell} from "../../spells/freeze";

export class FreezeScroll extends Scroll {
  constructor(context: Context) {
    super(context, FreezeSpell);
  }
}

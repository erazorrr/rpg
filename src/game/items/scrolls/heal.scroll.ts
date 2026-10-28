import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {HealSpell} from "../../spells/heal";

export class HealScroll extends Scroll {
  public static readonly saveId = "heal-scroll";
  constructor(context: Context) {
    super(context, HealSpell);
  }
}

import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {MinorHealSpell} from "../../spells/minor-heal";

export class MinorHealScroll extends Scroll {
  public static readonly saveId = "minor-heal-scroll";
  constructor(context: Context) {
    super(context, MinorHealSpell);
  }
}

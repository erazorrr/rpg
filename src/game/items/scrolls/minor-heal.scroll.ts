import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {MinorHealSpell} from "../../spells/minor-heal";

export class MinorHealScroll extends Scroll {
  constructor(context: Context) {
    super(context, MinorHealSpell);
  }
}

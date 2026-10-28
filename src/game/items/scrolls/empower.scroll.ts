import {Scroll} from "../../abstract.scroll";
import {EmpowerSpell} from "../../spells/empower";
import {Context} from "../../context";

export class EmpowerScroll extends Scroll {
  public static readonly saveId = "empower-scroll";
  constructor(context: Context) {
    super(context, EmpowerSpell);
  }
}

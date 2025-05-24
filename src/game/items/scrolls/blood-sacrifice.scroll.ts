import {Scroll} from "../../abstract.scroll";
import {BloodSacrificeSpell} from "../../spells/blood-sacrifice";
import {Context} from "../../context";

export class BloodSacrificeScroll extends Scroll {
  constructor(context: Context) {
    super(context, BloodSacrificeSpell);
  }
}

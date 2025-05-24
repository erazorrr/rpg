import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FireBoltSpell} from "../../spells/fire-bolt";

export class FireBoltScroll extends Scroll {
  constructor(context: Context) {
    super(context, FireBoltSpell);
  }
}

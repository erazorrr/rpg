import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FireBoltSpell} from "../../spells/fire-bolt";

export class FireBoltScroll extends Scroll {
  public static readonly saveId = "fire-bolt-scroll";
  constructor(context: Context) {
    super(context, FireBoltSpell);
  }
}

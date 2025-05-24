import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {IceRaySpell} from "../../spells/ice-ray";

export class IceRayScroll extends Scroll {
  constructor(context: Context) {
    super(context, IceRaySpell);
  }
}

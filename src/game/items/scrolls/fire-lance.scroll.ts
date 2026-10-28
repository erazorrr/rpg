import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {FireLanceSpell} from "../../spells/fire-lance";

export class FireLanceScroll extends Scroll {
  public static readonly saveId = "fire-lance-scroll";
  constructor(context: Context) {
    super(context, FireLanceSpell);
  }
}

import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {CatGraceSpell} from "../../spells/cat-grace";

export class CatGraceScroll extends Scroll {
  public static readonly saveId = "cat-grace-scroll";
  constructor(context: Context) {
    super(context, CatGraceSpell);
  }
}

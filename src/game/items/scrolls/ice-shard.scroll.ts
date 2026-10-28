import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {IceShardSpell} from "../../spells/ice-shard";

export class IceShardScroll extends Scroll {
  public static readonly saveId = "ice-shard-scroll";
  constructor(context: Context) {
    super(context, IceShardSpell);
  }
}

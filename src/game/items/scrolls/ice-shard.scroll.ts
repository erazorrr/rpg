import {Scroll} from "../../abstract.scroll";
import {Context} from "../../context";
import {IceShardSpell} from "../../spells/ice-shard";

export class IceShardScroll extends Scroll {
  constructor(context: Context) {
    super(context, IceShardSpell);
  }
}

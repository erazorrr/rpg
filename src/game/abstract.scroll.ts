import {Spell} from "./spell";
import {Item, ItemType} from "./item";
import {Char} from "../io/char";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";
import {Context} from "./context";

export abstract class Scroll extends Item {
  protected constructor(context: Context, public readonly spell: new () => Spell) {
    super(context, ItemType.Scroll, {}, Scroll.getCostBySpell(spell));
  }

  getChar(): Char {
    return {
      char: '~',
      color: ForegroundColor.SandyBrown,
      backgroundColor: BackgroundColor.Black,
    }
  }

  getBaseName(): string {
    return "Scroll of " + new this.spell().getName();
  }

  static getCostBySpell(spell: new () => Spell): number {
    const instance = new spell();
    return 4 * instance.level;
  }
}

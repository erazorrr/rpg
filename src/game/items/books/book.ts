import {BackgroundColor} from "../../../io/background.color";
import {Char} from "../../../io/char";
import {ForegroundColor} from "../../../io/foreground.color";
import {Context} from "../../context";
import {Item, ItemType} from "../../item";

export abstract class Book extends Item {
  protected constructor(
    context: Context,
    public readonly title: string,
    public readonly paragraphs: readonly string[],
    public readonly isUnique = false,
  ) {
    super(context, ItemType.Book, {}, 0);
  }

  getChar(): Char {
    return {
      char: 'B',
      color: ForegroundColor.DarkGoldenrod,
      backgroundColor: BackgroundColor.Black,
    };
  }

  getBaseName(): string {
    return `"${this.title}"`;
  }
}

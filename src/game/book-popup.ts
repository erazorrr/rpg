import * as process from "node:process";
import {BackgroundColor} from "../io/background.color";
import {Field} from "../io/field";
import {ForegroundColor} from "../io/foreground.color";
import {InputEmitter} from "../io/input.emitter";
import {InputEvent} from "../io/input.event";
import {Position} from "../io/position";
import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Context} from "./context";
import {Interactive} from "./interactive.interface";
import {Book} from "./items/books/book";
import {getCenteredBounds} from './screen-layout';

export function wrapBookParagraph(paragraph: string, width: number): string[] {
  if (width < 1) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of paragraph.split(/\s+/)) {
    if (!word) continue;
    if (line.length === 0) {
      line = word;
    } else if (line.length + word.length + 1 <= width) {
      line += ` ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export class BookPopup extends GameObject implements Renderable, Interactive {
  private readonly emitter = new InputEmitter();
  private field: Field;
  private lines: string[] = [];
  private viewportHeight = 1;
  private contentWidth = 1;
  private textOrigin = new Position(0, 0);
  private footerPosition = new Position(0, 0);
  private scrollOffset = 0;

  constructor(context: Context, private readonly book: Book) {
    super(context);
    const terminalWidth = process.stdout.columns || 120;
    const terminalHeight = process.stdout.rows || 40;
    this.field = new Field(
      book.getBaseName(),
      new Position(0, 0),
      new Position(2, 2),
    );
    this.resize(Math.max(3, terminalWidth - 32), Math.max(3, terminalHeight - 2));
  }

  resize(containerWidth: number, containerHeight: number): void {
    const previousMaxOffset = Math.max(0, this.lines.length - this.viewportHeight);
    const progress = previousMaxOffset === 0 ? 0 : this.scrollOffset / previousMaxOffset;
    const widthBounds = getCenteredBounds(containerWidth, containerHeight, 110, 10);
    const popupWidth = widthBounds.bottomRight.x - widthBounds.topLeft.x + 1;
    this.contentWidth = Math.max(1, popupWidth - 4);
    this.lines = this.book.paragraphs.flatMap((paragraph, index) => [
      ...(index > 0 ? [''] : []),
      ...wrapBookParagraph(paragraph, this.contentWidth),
    ]);

    const desiredHeight = Math.max(10, this.lines.length + 6);
    const bounds = getCenteredBounds(containerWidth, containerHeight, popupWidth, desiredHeight);
    const popupHeight = bounds.bottomRight.y - bounds.topLeft.y + 1;
    this.field.setBounds(bounds.topLeft, bounds.bottomRight);
    this.viewportHeight = Math.max(1, popupHeight - 6);
    this.textOrigin = bounds.topLeft.shift(2, 2);
    this.footerPosition = new Position(bounds.topLeft.x + 2, bounds.bottomRight.y - 2);
    const maxOffset = Math.max(0, this.lines.length - this.viewportHeight);
    this.scrollOffset = Math.max(0, Math.min(maxOffset, Math.round(progress * maxOffset)));
  }

  makeInteractive(): void {
    this.emitter.on(InputEvent.ARROW_UP, this, () => this.scroll(-1));
    this.emitter.on(InputEvent.ARROW_DOWN, this, () => this.scroll(1));
  }

  makeUninteractive(): void {
    this.emitter.clear(this);
  }

  private scroll(amount: number): void {
    const maxOffset = Math.max(0, this.lines.length - this.viewportHeight);
    this.scrollOffset = Math.max(0, Math.min(maxOffset, this.scrollOffset + amount));
    this.render();
    this.context.getRenderer().flush(true);
  }

  render(): void {
    const renderer = this.context.getRenderer();
    this.field.render(renderer);
    const visibleLines = this.lines.slice(this.scrollOffset, this.scrollOffset + this.viewportHeight);
    for (let y = 0; y < visibleLines.length; y++) {
      for (let x = 0; x < visibleLines[y].length; x++) {
        renderer.put(this.textOrigin.shift(x, y), {
          char: visibleLines[y][x],
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
      }
    }

    const canScrollUp = this.scrollOffset > 0;
    const canScrollDown = this.scrollOffset + this.viewportHeight < this.lines.length;
    const scrollHint = canScrollUp || canScrollDown ? ' [Up/Down] Scroll' : '';
    const footer = `[Enter/Escape] Close${scrollHint}`.slice(0, this.contentWidth);
    for (let x = 0; x < footer.length; x++) {
      renderer.put(this.footerPosition.shift(x, 0), {
        char: footer[x],
        color: ForegroundColor.Grey69,
        backgroundColor: BackgroundColor.Black,
      });
    }
  }
}

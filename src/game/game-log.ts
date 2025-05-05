import {Renderer} from "src/io/renderer";
import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class GameLog implements Renderable {
  private buffer: string[] = [];
  public isStale: boolean = false;

  constructor(public width: number) {}

  clear(): void {
    this.buffer = [];
    this.isStale = false;
  }

  log(message: string): void {
    if (this.isStale) {
      this.buffer = [];
      this.isStale = false;
    }
    this.buffer.push(message);
  }

  private printLine(renderer: Renderer, i: number, color: ForegroundColor, line: string): number {
    renderer.put(new Position(0, i), {
      char: '>',
      color: ForegroundColor.White,
      backgroundColor: BackgroundColor.Black,
    });

    let j = 1;
    for (const word of line.split(' ')) {
      if (j + word.length >= this.width - 1) {
        i++;
        j = 0;
      }
      for (const char of word) {
        renderer.put(new Position(j, i), {
          char: char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        j++;
      }
      renderer.put(new Position(j, i), {
        char: ' ',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      j++;
    }

    i++;
    return i;
  }

  render(renderer: Renderer): void {
    let i = 0;
    for (const line of this.buffer) {
      i = this.printLine(renderer, i, this.isStale ? ForegroundColor.Grey35 : ForegroundColor.White, line);
    }
    this.isStale = true;
  }
}

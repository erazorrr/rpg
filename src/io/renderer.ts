import {Char} from "./char";
import {Position} from "./position";
import * as process from "node:process";
import {ForegroundColor} from "./foreground.color";
import {BackgroundColor} from "./background.color";

export class Renderer {
  private buffer: string = '';

  private moveCursor(position: Position): void {
    this.buffer += `\x1b[${position.y + 1};${position.x + 1}H`;
  }

  private setStyle(color: ForegroundColor, bgColor: BackgroundColor): void {
    // this.buffer += `\x1b[${color};${bgColor}m`;
    this.buffer += `\x1b[38;5;${color};48;5;${bgColor}m`;
  }

  private putChar(char: string): void {
    this.buffer += char;
  }

  private resetStyle(): void {
    this.buffer += `\x1b[0m`;
  }

  hideCursor(): void {
    this.buffer += `\x1b[?25l`;
  }

  showCursor(): void {
    this.buffer += `\x1b[?25h`;
  }

  put(position: Position, c: Char): void {
    this.moveCursor(position);
    this.setStyle(c.color, c.backgroundColor);
    this.putChar(c.char);
    this.resetStyle();
  }

  flush() {
    process.stdout.write(this.buffer);
    this.buffer = '';
  }
}

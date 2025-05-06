import {Char} from "./char";
import {Position, SerializedPosition} from "./position";
import * as process from "node:process";
import {ForegroundColor} from "./foreground.color";
import {BackgroundColor} from "./background.color";

let buffer: Record<SerializedPosition, string> = {};
let prevBuffer: Record<SerializedPosition, string> = {};
export class Renderer {
  private currentPosition: Position = new Position(0, 0);

  private moveCursor(position: Position): void {
    this.currentPosition = position;
    buffer[this.currentPosition.serialize()] = '';
  }

  private setStyle(color: ForegroundColor, bgColor: BackgroundColor): void {
    buffer[this.currentPosition.serialize()] += `\x1b[38;5;${color};48;5;${bgColor}m`;
  }

  private putChar(char: string): void {
    buffer[this.currentPosition.serialize()] += char;
  }

  hideCursor(): void {
    process.stdout.write(`\x1b[?25l`);
  }

  showCursor(): void {
    process.stdout.write(`\x1b[?25h`);
  }

  put(position: Position, c: Char): void {
    this.moveCursor(position);
    this.setStyle(c.color, c.backgroundColor);
    this.putChar(c.char);
  }

  flush() {
    for (const key in buffer) {
      if (prevBuffer[key] !== buffer[key]) {
        const position = Position.deserialize(key);
        process.stdout.write(`\x1b[${position.y + 1};${position.x + 1}H`)
        process.stdout.write(buffer[key]);
      }
    }
    prevBuffer = buffer;
    buffer = {};
  }
}

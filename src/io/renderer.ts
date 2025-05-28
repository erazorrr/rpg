import {Char} from "./char";
import {Position, SerializedPosition} from "./position";
import * as process from "node:process";
import {ForegroundColor} from "./foreground.color";
import {BackgroundColor} from "./background.color";

let buffer: Record<SerializedPosition, string> = {};
let prevBuffer: Record<SerializedPosition, string> = {};
const plannedProjectiles: Array<{
  path: Position[];
  projectile: Char;
}> = [];
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

  private getColorFromBuffer(b: Record<SerializedPosition, string>, position: Position): ForegroundColor {
    const content = b[position.serialize()];
    if (!content) {
      return null;
    }
    return +(content.match(/\[38;5;(.+);48;5;/)[1]);
  }

  private getBackgroundColorFromBuffer(b: Record<SerializedPosition, string>, position: Position): BackgroundColor {
    const content = b[position.serialize()];
    if (!content) {
      return null;
    }
    return +(content.match(/;48;5;(.+)m/)[1]);
  }

  private getCharFromBuffer(b: Record<SerializedPosition, string>, position: Position): string {
    const content = b[position.serialize()];
    if (!content) {
      return null;
    }
    return content.match(/;48;5;(.+)m(.)/)[2];
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

  private pause(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // do nothing
    }
  }

  renderProjectile(path: Position[], projectile: Char) {
    if (path.length > 0) {
      plannedProjectiles.push({
        path,
        projectile,
      });
    }
  }

  private ANIMATION_MAX_LENGTH_MS = 150;
  private ANIMATION_TICK_MAX_LENGTH = 20;
  private flushProjectiles() {
    let j = 0;
    let maxPathLength = 0;
    while (plannedProjectiles.length > 0) {
      for (let i = 0; i < plannedProjectiles.length; i++) {
        const { path, projectile } = plannedProjectiles[i];
        maxPathLength = Math.max(maxPathLength, path.length);
        const current = path[j];
        const previous = path[j - 1];
        if (previous && buffer[previous.serialize()]) {
          process.stdout.write(`\x1b[${previous.y + 1};${previous.x + 1}H`);
          process.stdout.write(`\x1b[38;5;${this.getColorFromBuffer(buffer, previous)};48;5;${this.getBackgroundColorFromBuffer(buffer, previous)}m`);
          process.stdout.write(this.getCharFromBuffer(buffer, previous));
        }
        if (current) {
          process.stdout.write(`\x1b[${current.y + 1};${current.x + 1}H`);
          process.stdout.write(`\x1b[38;5;${projectile.color};48;5;${this.getBackgroundColorFromBuffer(buffer, current)}m`);
          process.stdout.write(`${projectile.char}`);
        } else {
          plannedProjectiles.splice(i, 1);
          i--;
        }
      }
      j++;
      this.pause(Math.min(this.ANIMATION_TICK_MAX_LENGTH, Math.round(this.ANIMATION_MAX_LENGTH_MS / maxPathLength)));
    }
  }

  flush(isBuffered = true, drawProjectiles = true): void {
    if (drawProjectiles) {
      this.flushProjectiles();
    } else {
      plannedProjectiles.splice(0);
    }

    for (const key in buffer) {
      if (!isBuffered || prevBuffer[key] !== buffer[key]) {
        const position = Position.deserialize(key);
        process.stdout.write(`\x1b[${position.y + 1};${position.x + 1}H`)
        process.stdout.write(buffer[key]);
      }
    }
    prevBuffer = buffer;
    buffer = {};
  }
}

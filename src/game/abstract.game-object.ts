import {Context} from "./context";
import {Position} from "../io/position";

export abstract class GameObject {
  constructor(
    protected context: Context
  ) {
  }

  private canPassLight(position: Position): boolean {
    const tile = this.context.getCurrentMap().getTile(position);
    if (!tile || !tile.isNavigable()) {
      return false;
    }
    if (this.context.getPlayer().position.equals(position)) {
      return false;
    }
    if (this.context.getCharacter(position)) {
      return false;
    }
    return true;
  }

  public isVisible(rootPosition: Position, targetPosition: Position, radius: number): Position[] | null {
    if (rootPosition.equals(targetPosition)) {
      return [];
    }

    const distance = rootPosition.distanceTo(targetPosition);

    if (distance > radius) {
      return null;
    }

    if (distance === 1) {
      return [];
    }

    let x0 = rootPosition.x;
    let y0 = rootPosition.y;
    const x1 = targetPosition.x;
    const y1 = targetPosition.y;

    const dxAbs = Math.abs(x1 - x0);
    const dyAbs = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dxAbs - dyAbs;

    let prevX = x0;
    let prevY = y0;

    const result: Position[] = [];

    while (!(x0 === x1 && y0 === y1)) {
      if (!(x0 === rootPosition.x && y0 === rootPosition.y)) {
        const pos = new Position(x0, y0);

        const dxStep = x0 - prevX;
        const dyStep = y0 - prevY;
        if (Math.abs(dxStep) === 1 && Math.abs(dyStep) === 1) {
          const pos1 = new Position(prevX, y0);
          const pos2 = new Position(x0, prevY);
          if (!this.canPassLight(pos1) || !this.canPassLight(pos2)) {
            return null;
          }
        }

        if (!this.canPassLight(pos)) {
          return null;
        }

        result.push(pos);
      }

      prevX = x0;
      prevY = y0;

      const e2 = 2 * err;
      if (e2 > -dyAbs) {
        err -= dyAbs;
        x0 += sx;
      }
      if (e2 < dxAbs) {
        err += dxAbs;
        y0 += sy;
      }
    }

    return result;
  }
}

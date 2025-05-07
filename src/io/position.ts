export type SerializedPosition = string;

export class Position {
  constructor(public x: number, public y: number) {
  }

  up(): Position {
    return new Position(this.x, this.y - 1);
  }

  down(): Position {
    return new Position(this.x, this.y + 1);
  }

  left(): Position {
    return new Position(this.x - 1, this.y);
  }

  right(): Position {
    return new Position(this.x + 1, this.y);
  }

  shift(x: number, y: number): Position {
    return new Position(this.x + x, this.y + y);
  }

  distanceTo(p: Position): number {
    return Math.abs(this.x - p.x) + Math.abs(this.y - p.y);
  }

  equals(p: Position): boolean {
    return this.x === p.x && this.y === p.y;
  }

  serialize(): SerializedPosition {
    return `${this.x},${this.y}`;
  }

  static deserialize(p: SerializedPosition): Position {
    const [x, y] = p.split(',');
    return new Position(+x, +y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Position {
    return new Position(Math.round(this.x / this.length()), Math.round(this.y / this.length()));
  }
}

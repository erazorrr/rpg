import {Char} from '../io/char';
import {BackgroundColor} from '../io/background.color';
import {ForegroundColor} from '../io/foreground.color';

export type AtmosphereKind = 'smoke' | 'steam' | 'fog';
export type CardinalDirection = 'up' | 'down' | 'left' | 'right';

export type AtmosphereCell = {
  kind: AtmosphereKind;
  turnsLeft: number;
  density: 1 | 2 | 3;
  drift: CardinalDirection;
  driftIn: number;
};

export type AtmosphereEmission = {
  kind: AtmosphereKind;
  turns: number;
  density: 1 | 2 | 3;
  shape: 'single' | 'cross';
};

export function atmosphereDriftPeriod(kind: AtmosphereKind): number {
  if (kind === 'steam') return 1;
  if (kind === 'fog') return 3;
  return 2;
}

export function getAtmosphereChar(cell: AtmosphereCell, frame = 0): Char {
  if (cell.kind === 'steam') {
    return {
      char: frame % 2 ? '~' : '≈',
      color: ForegroundColor.LightCyan1,
      backgroundColor: BackgroundColor.Black,
    };
  }
  if (cell.kind === 'fog') {
    return {
      char: frame % 2 ? '·' : '.',
      color: ForegroundColor.DarkSeaGreen,
      backgroundColor: BackgroundColor.Black,
    };
  }
  return {
    char: cell.density === 3 ? '▒' : '░',
    color: ForegroundColor.Grey53,
    backgroundColor: BackgroundColor.Black,
  };
}

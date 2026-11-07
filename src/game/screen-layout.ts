import {Position} from '../io/position';

export const MIN_TERMINAL_COLUMNS = 80;
export const MIN_TERMINAL_ROWS = 40;

const SIDE_PANEL_WIDTH = 30;
const LOG_PANEL_HEIGHT = 20;

export type Bounds = {
  topLeft: Position;
  bottomRight: Position;
};

export type ScreenLayout = {
  columns: number;
  rows: number;
  isSupported: boolean;
  game: Bounds;
  menu: Bounds;
  log: Bounds;
  fullScreen: Bounds;
};

function normalizeDimension(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

export function calculateScreenLayout(columns: number | undefined, rows: number | undefined): ScreenLayout {
  const safeColumns = normalizeDimension(columns);
  const safeRows = normalizeDimension(rows);
  const gameRight = Math.max(1, safeColumns - SIDE_PANEL_WIDTH - 1);
  const panelLeft = Math.max(0, safeColumns - SIDE_PANEL_WIDTH);
  const menuBottom = Math.max(1, safeRows - LOG_PANEL_HEIGHT - 1);
  const logTop = Math.max(0, safeRows - LOG_PANEL_HEIGHT);

  return {
    columns: safeColumns,
    rows: safeRows,
    isSupported: safeColumns >= MIN_TERMINAL_COLUMNS && safeRows >= MIN_TERMINAL_ROWS,
    game: {
      topLeft: new Position(0, 0),
      bottomRight: new Position(gameRight, safeRows - 1),
    },
    menu: {
      topLeft: new Position(panelLeft, 0),
      bottomRight: new Position(safeColumns - 1, menuBottom),
    },
    log: {
      topLeft: new Position(panelLeft, logTop),
      bottomRight: new Position(safeColumns - 1, safeRows - 1),
    },
    fullScreen: {
      topLeft: new Position(0, 0),
      bottomRight: new Position(safeColumns - 1, safeRows - 1),
    },
  };
}

export function getCenteredBounds(
  containerWidth: number,
  containerHeight: number,
  preferredWidth: number,
  preferredHeight: number,
  margin = 1,
): Bounds {
  const availableWidth = Math.max(3, containerWidth - margin * 2);
  const availableHeight = Math.max(3, containerHeight - margin * 2);
  const width = Math.min(preferredWidth, availableWidth);
  const height = Math.min(preferredHeight, availableHeight);
  const left = Math.max(0, Math.floor((containerWidth - width) / 2));
  const top = Math.max(0, Math.floor((containerHeight - height) / 2));
  return {
    topLeft: new Position(left, top),
    bottomRight: new Position(left + width - 1, top + height - 1),
  };
}

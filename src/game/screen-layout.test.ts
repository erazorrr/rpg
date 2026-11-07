import {
  calculateScreenLayout,
  getCenteredBounds,
  MIN_TERMINAL_COLUMNS,
  MIN_TERMINAL_ROWS,
} from './screen-layout';

describe('screen layout', () => {
  test('uses the current terminal size for the game and side panels', () => {
    const layout = calculateScreenLayout(120, 40);

    expect(layout.isSupported).toBe(true);
    expect(layout.game.bottomRight.serialize()).toBe('89,39');
    expect(layout.menu.topLeft.serialize()).toBe('90,0');
    expect(layout.menu.bottomRight.serialize()).toBe('119,19');
    expect(layout.log.topLeft.serialize()).toBe('90,20');
    expect(layout.log.bottomRight.serialize()).toBe('119,39');
  });

  test('rejects dimensions below either supported minimum without producing negative bounds', () => {
    const narrow = calculateScreenLayout(MIN_TERMINAL_COLUMNS - 1, MIN_TERMINAL_ROWS);
    const short = calculateScreenLayout(MIN_TERMINAL_COLUMNS, MIN_TERMINAL_ROWS - 1);
    const missing = calculateScreenLayout(undefined, undefined);
    const invalid = calculateScreenLayout(Number.NaN, Number.POSITIVE_INFINITY);

    expect(narrow.isSupported).toBe(false);
    expect(short.isSupported).toBe(false);
    expect(missing.isSupported).toBe(false);
    expect(invalid.columns).toBe(1);
    expect(invalid.rows).toBe(1);
    expect(missing.game.bottomRight.x).toBeGreaterThanOrEqual(0);
    expect(missing.game.bottomRight.y).toBeGreaterThanOrEqual(0);
  });

  test('centers preferred bounds and clamps them to the available container', () => {
    const preferred = getCenteredBounds(100, 40, 50, 15);
    const clamped = getCenteredBounds(30, 12, 50, 15);

    expect(preferred.topLeft.serialize()).toBe('25,12');
    expect(preferred.bottomRight.serialize()).toBe('74,26');
    expect(clamped.topLeft.serialize()).toBe('1,1');
    expect(clamped.bottomRight.serialize()).toBe('28,10');
  });
});

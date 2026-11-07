import {Position} from '../io/position';
import {GrassTile} from './tiles/grass.tile';
import {ShallowWaterTile} from './tiles/shallow-water.tile';
import {WaterTile} from './tiles/water.tile';
import {HeatGrateTile} from './tiles/heat-grate.tile';

describe('idle terrain animation', () => {
  const position = new Position(7, 11);

  test.each([
    new WaterTile(),
    new ShallowWaterTile(),
    new GrassTile(),
  ])('is deterministic for a tile, position, and frame', tile => {
    tile.setExplored(true);
    const frame = {frame: 14, elapsedMs: 1400};

    expect(tile.getChar(frame, position)).toEqual(tile.getChar(frame, position));
  });

  test('deep water changes on its 200 ms cadence', () => {
    const tile = new WaterTile();
    tile.setExplored(true);
    const observed = new Set(
      Array.from({length: 10}, (_, frame) =>
        tile.getChar({frame: frame * 2, elapsedMs: frame * 200}, position).char
      ),
    );

    expect(observed).toEqual(new Set(['~', '-']));
  });

  test('bloody shallow water and grass keep their bloody backgrounds', () => {
    const tiles = [new ShallowWaterTile(), new GrassTile()];
    for (const tile of tiles) {
      tile.setExplored(true);
      tile.setBloody(true);
      const first = tile.getChar({frame: 0, elapsedMs: 0}, position).backgroundColor;
      const later = tile.getChar({frame: 40, elapsedMs: 4000}, position).backgroundColor;
      expect(later).toBe(first);
    }
  });

  test('heat grate light slowly pulses into adjacent tiles', () => {
    const tile = new HeatGrateTile();
    const position = new Position(0, 0);

    expect(tile.getLight({frame: 0, elapsedMs: 0}, position).innerRadius).toBe(0);
    expect(tile.getLight({frame: 8, elapsedMs: 800}, position).innerRadius).toBe(1);
    expect(tile.getLight({frame: 16, elapsedMs: 1600}, position).innerRadius).toBe(0);
  });
});

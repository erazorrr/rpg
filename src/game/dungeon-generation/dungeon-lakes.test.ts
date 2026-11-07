import {Position} from '../../io/position';
import {CaveFloorTile} from '../tiles/cave-floor.tile';
import {ShallowWaterTile} from '../tiles/shallow-water.tile';
import {WaterTile} from '../tiles/water.tile';
import {addRareUndergroundLake} from './dungeon-lakes';
import {DungeonBiome, DungeonDraft, DungeonRegion} from './dungeon-layout';

function sequence(values: number[], fallback = 0): () => number {
  return () => values.shift() ?? fallback;
}

function cavernDraft(): DungeonDraft {
  const topLeft = new Position(1, 1);
  const bottomRight = new Position(13, 9);
  const floor: Position[] = [];
  const tiles = Array.from({length: 15}, () => Array.from({length: 11}, () => new CaveFloorTile()));
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) floor.push(new Position(x, y));
  }
  const room: DungeonRegion = {
    id: 0,
    kind: 'room',
    topLeft,
    bottomRight,
    floor,
    entrances: [],
    neighbours: [],
    anchor: new Position(7, 5),
    biome: DungeonBiome.Cavern,
  };
  return {
    tiles,
    regions: [room],
    upstairs: new Position(1, 1),
    downstairs: new Position(13, 9),
    reserved: new Set(),
    encounters: [],
  };
}

describe('rare underground lakes', () => {
  it('usually leaves dungeon terrain unchanged', () => {
    const draft = cavernDraft();

    expect(addRareUndergroundLake(draft, () => .15)).toBeNull();
    expect(draft.tiles.flat().some(tile => tile instanceof WaterTile)).toBe(false);
  });

  it('can generate a lake without a ford', () => {
    const draft = cavernDraft();
    const lake = addRareUndergroundLake(draft, sequence([0, .9, .9, 0]));

    expect(lake).not.toBeNull();
    expect(lake!.hasFord).toBe(false);
    expect(lake!.deepWater.length).toBeGreaterThan(0);
    expect(lake!.shallowWater.length).toBeGreaterThan(0);
    expect(draft.tiles.flat().some(tile => tile instanceof WaterTile)).toBe(true);
  });

  it('can add a shallow ford and a reachable island', () => {
    const draft = cavernDraft();
    const lake = addRareUndergroundLake(draft, () => 0);

    expect(lake).not.toBeNull();
    expect(lake!.hasFord).toBe(true);
    expect(lake!.islands).toHaveLength(1);
    expect(lake!.shallowWater.some(position => position.y === lake!.islands[0].y)).toBe(true);
    expect(draft.tiles.flat().some(tile => tile instanceof ShallowWaterTile)).toBe(true);
  });
});

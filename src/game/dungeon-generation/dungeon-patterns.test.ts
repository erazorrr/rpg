import {Position} from '../../io/position';
import {applyDungeonBiomes, assignDungeonBiomes} from './dungeon-biomes';
import {generateDungeonLayout} from './dungeon-layout';
import {addRareDungeonPattern, DungeonPattern} from './dungeon-patterns';
import {validateDungeonTerrain} from './dungeon-validation';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function generateWithPatternChoice(choice: number): {pattern: DungeonPattern | null; patternCount: number; loopIsRegion: boolean} {
  const random = seeded(1);
  const draft = generateDungeonLayout(100, 100, new Position(99, 40), random);
  assignDungeonBiomes(draft, 2, random);
  applyDungeonBiomes(draft, random);
  const forcedRolls = [0, choice];
  const pattern = addRareDungeonPattern(draft, () => forcedRolls.shift() ?? random());

  expect(() => validateDungeonTerrain(draft)).not.toThrow();
  return {
    pattern,
    patternCount: draft.regions.filter(region => region.pattern).length,
    loopIsRegion: draft.regions.some(region =>
      region.pattern === 'local-loop' && region.kind === 'corridor' && region.neighbours.length === 2,
    ),
  };
}

describe('rare dungeon patterns', () => {
  it.each([
    [0, 'pillared-hall'],
    [.4, 'split-chamber'],
    [.8, 'local-loop'],
  ] as const)('can build the selected connected %s pattern', (choice, expected) => {
    const result = generateWithPatternChoice(choice);
    expect(result.pattern).toBe(expected);
    expect(result.patternCount).toBe(1);
    if (expected === 'local-loop') expect(result.loopIsRegion).toBe(true);
  });

  it('adds nothing when the rarity roll misses', () => {
    const random = seeded(3);
    const draft = generateDungeonLayout(100, 100, new Position(99, 40), random);
    assignDungeonBiomes(draft, 2, random);
    applyDungeonBiomes(draft, random);

    expect(addRareDungeonPattern(draft, () => .9)).toBeNull();
    expect(draft.regions.some(region => region.pattern)).toBe(false);
  });
});

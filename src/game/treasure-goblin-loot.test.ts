import {Context} from './context';
import {ItemType} from './item';
import {LootGenerator} from './loot-generator';

describe('treasure goblin prize loot', () => {
  afterEach(() => jest.restoreAllMocks());

  it('uses the boosted budget without consulting potion preference', () => {
    const getPlayer = jest.fn(() => {
      throw new Error('Treasure prizes must not inspect the player potion inventory');
    });
    const context = {getPlayer} as unknown as Context;
    const generator = new LootGenerator(context);

    for (const roll of [0.15, 0.35, 0.55, 0.75, 0.95]) {
      jest.spyOn(Math, 'random').mockReturnValue(roll);
      const prize = generator.generateTreasurePrize(14);
      jest.restoreAllMocks();

      expect(prize).not.toBeNull();
      expect(prize!.type).not.toBe(ItemType.Potion);
      expect(prize!.getCost()).toBeLessThanOrEqual(21);
      expect(prize!.getCost()).toBeGreaterThan(0);
    }
    expect(getPlayer).not.toHaveBeenCalled();
  });
});

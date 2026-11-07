import {Context} from './context';
import {ChampionStrength} from './item-modifiers/champion-strength';
import {GiantStrength} from './item-modifiers/giant-strength';
import {LeviathanStrength} from './item-modifiers/leviathan-strength';
import {IronModifier} from './item-modifiers/weapon/material/iron';
import {SteelModifier} from './item-modifiers/weapon/material/steel';
import {Item} from './item';
import {ShortSword} from './items/weapons/short-sword';
import {LootGenerator} from './loot-generator';

describe('floor loot tiers', () => {
  const context = {} as Context;

  it('unlocks material and affix tiers one dungeon floor at a time', () => {
    const generator = new LootGenerator(context);
    const fits = (item: Item, depth: number, treasure = false): boolean =>
      generator['itemFitsDepth'](item, depth, treasure);

    expect(fits(new ShortSword(context).applyModifier(new IronModifier()), 1)).toBe(false);
    expect(fits(new ShortSword(context).applyModifier(new IronModifier()), 2)).toBe(true);
    expect(fits(new ShortSword(context).applyModifier(new SteelModifier()), 2)).toBe(false);
    expect(fits(new ShortSword(context).applyModifier(new SteelModifier()), 3)).toBe(true);
    expect(fits(new ShortSword(context).applyModifier(new ChampionStrength()), 1)).toBe(false);
    expect(fits(new ShortSword(context).applyModifier(new ChampionStrength()), 2)).toBe(true);
    expect(fits(new ShortSword(context).applyModifier(new GiantStrength()), 2)).toBe(false);
    expect(fits(new ShortSword(context).applyModifier(new GiantStrength()), 3)).toBe(true);
    expect(fits(new ShortSword(context).applyModifier(new LeviathanStrength()), 3)).toBe(false);
    expect(fits(new ShortSword(context).applyModifier(new LeviathanStrength()), 3, true)).toBe(true);
  });

  it('never combines two high-tier positive affixes on one generated item', () => {
    const generator = new LootGenerator(context);
    const highTierIds = new Set([
      'champion-strength', 'giant-strength', 'leviathan-strength',
      'champion-dexterity', 'giant-dexterity',
      'champion-endurance', 'giant-endurance', 'leviathan-endurance',
      'champion-health', 'giant-health',
      'champion-wisdom', 'giant-wisdom', 'leviathan-wisdom',
      'champion-focus', 'giant-focus', 'champion-power', 'giant-power',
      'champion-hp-per-hit',
    ]);

    for (const item of Object.values(generator['loot']).flat()) {
      const highTierCount = item.getModifiers().filter(modifier => highTierIds.has(modifier.saveId)).length;
      expect(highTierCount).toBeLessThanOrEqual(1);
    }
  });
});

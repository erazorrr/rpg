import {Context} from './context';
import {ChampionAntiDexterity} from './item-modifiers/champion-anti-dexterity';
import {ChampionAntiEndurance} from './item-modifiers/champion-anti-endurance';
import {ChampionAntiHealth} from './item-modifiers/champion-anti-health';
import {ChampionAntiStrength} from './item-modifiers/champion-anti-strength';
import {ChampionAntiWisdom} from './item-modifiers/champion-anti-wisdom';
import {ChampionStrength} from './item-modifiers/champion-strength';
import {ChampionWisdom} from './item-modifiers/champion-wisdom';
import {restoreItemModifier} from './item-modifiers/item-modifier.factory';
import {restoreItem} from './items/item.factory';
import {ShortSword} from './items/weapons/short-sword';
import {LootGenerator} from './loot-generator';

describe('champion anti-modifier tradeoffs', () => {
  const context = {} as Context;
  const drawbackConstructors = [
    ChampionAntiStrength,
    ChampionAntiDexterity,
    ChampionAntiEndurance,
    ChampionAntiWisdom,
    ChampionAntiHealth,
  ];
  const drawbackIds = new Set<string>(drawbackConstructors.map(Constructor => Constructor.saveId));
  const highTierPositiveIds = new Set<string>([
    'champion-strength', 'giant-strength', 'leviathan-strength',
    'champion-dexterity', 'giant-dexterity',
    'champion-endurance', 'giant-endurance', 'leviathan-endurance',
    'champion-health', 'giant-health',
    'champion-wisdom', 'giant-wisdom', 'leviathan-wisdom',
    'champion-focus', 'giant-focus',
    'champion-power', 'giant-power',
    'champion-hp-per-hit',
  ]);

  it('only generates a single champion drawback beside a high-tier benefit', () => {
    const generated = Object.values(new LootGenerator(context)['loot']).flat();
    const tradeoffs = generated.filter(item =>
      item.getModifiers().some(modifier => drawbackIds.has(modifier.saveId)),
    );

    expect(tradeoffs.length).toBeGreaterThan(0);
    for (const item of tradeoffs) {
      const modifiers = item.getModifiers();
      expect(modifiers.filter(modifier => drawbackIds.has(modifier.saveId))).toHaveLength(1);
      expect(modifiers.some(modifier => highTierPositiveIds.has(modifier.saveId))).toBe(true);
      expect(item.getCost()).toBeGreaterThan(0);
    }
  });

  it('restores every champion drawback by its stable save ID', () => {
    for (const Constructor of drawbackConstructors) {
      expect(restoreItemModifier(Constructor.saveId)).toBeInstanceOf(Constructor);
    }

    const sword = new ShortSword(context);
    sword.applyModifier(new ChampionStrength());
    sword.applyModifier(new ChampionAntiWisdom());
    const restored = restoreItem(context, sword.toSaveData());
    expect(restored.getModifiers().map(modifier => modifier.saveId)).toEqual([
      ChampionStrength.saveId,
      ChampionAntiWisdom.saveId,
    ]);
  });

  it('labels champion wisdom consistently with its tier', () => {
    expect(new ChampionWisdom().name).toBe('champion wisdom');
  });
});

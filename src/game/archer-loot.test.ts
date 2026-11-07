import {Context} from './context';
import {ArchersBracers} from './items/gauntlets/archers-bracers';
import {LeatherGauntlets} from './items/gauntlets/leather-gauntlets';
import {LeatherBoots} from './items/boots/leather-boots';
import {TrailBoots} from './items/boots/trail-boots';
import {LeatherArmor} from './items/chest/leather-armor';
import {PaddedCoat} from './items/chest/padded-coat';
import {restoreItem} from './items/item.factory';
import {Arbalest} from './items/weapons/arbalest';
import {Bow} from './items/weapons/bow';
import {CompositeBow} from './items/weapons/composite-bow';
import {Crossbow} from './items/weapons/crossbow';
import {RecurveBow} from './items/weapons/recurve-bow';
import {Sling} from './items/weapons/sling';
import {LootGenerator} from './loot-generator';

describe('archer loot assortment', () => {
  const context = {} as Context;

  it('offers three equal-average profiles in each ranged power tier', () => {
    const lowerTier = [new Bow(context), new RecurveBow(context), new Sling(context)];
    const upperTier = [new Crossbow(context), new Arbalest(context), new CompositeBow(context)];
    const averageDamage = (weapon: Bow): number =>
      (weapon.stats.damageRoll! + 1) / 2 + weapon.stats.damageBonus!;

    expect(lowerTier.map(averageDamage)).toEqual([3, 3, 3]);
    expect(upperTier.map(averageDamage)).toEqual([4, 4, 4]);
    expect([...lowerTier, ...upperTier].every(weapon => weapon.isRanged)).toBe(true);
  });

  it('doubles each light armor slot without changing its stats or cost', () => {
    const pairs = [
      [new LeatherArmor(context), new PaddedCoat(context)],
      [new LeatherBoots(context), new TrailBoots(context)],
      [new LeatherGauntlets(context), new ArchersBracers(context)],
    ];

    for (const [existing, alternative] of pairs) {
      expect(alternative.stats).toEqual(existing.stats);
      expect(alternative.getCost()).toBe(existing.getCost());
      expect(restoreItem(context, alternative.toSaveData())).toBeInstanceOf(alternative.constructor);
    }
  });

  it('registers every new base in ordinary generated loot', () => {
    const generator = new LootGenerator(context);
    const generated = Object.values(generator['loot']).flat();
    const constructors = [
      RecurveBow, Sling, Arbalest, CompositeBow,
      PaddedCoat, TrailBoots, ArchersBracers,
    ];

    for (const Constructor of constructors) {
      expect(generated.some(item => item instanceof Constructor)).toBe(true);
    }
  });
});

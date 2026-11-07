jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {Bow} from './items/weapons/bow';
import {Wand} from './items/weapons/wand';
import {CinderWand} from './items/weapons/cinder-wand';
import {RimeWand} from './items/weapons/rime-wand';
import {SerpentWand} from './items/weapons/serpent-wand';
import {restoreItem} from './items/item.factory';
import {Level} from './level';
import {GoblinSkirmisher} from './monsters/goblin-skirmisher';
import {restoreNpc} from './monsters/npc.factory';
import {Player} from './player';
import {Staff} from './items/weapons/staff';
import {Skeleton} from './monsters/skeleton';
import {BloodBat} from './monsters/blood-bat';
import {FlameCinderling} from './monsters/flame-cinderling';

describe('early archetype balance', () => {
  const context = {} as Context;

  it('gives the fragile goblin skirmisher two movement steps', () => {
    const level = {} as Level;
    const skirmisher = new GoblinSkirmisher(context, level, new Position(0, 0));

    expect(skirmisher.getSpeed()).toBe(2);
    expect(skirmisher.getMaxHp()).toBeLessThan(20);
    expect(restoreNpc(context, level, skirmisher.toSaveData())).toBeInstanceOf(GoblinSkirmisher);
  });

  it('makes a wand a weaker, zero-MP ranged fallback than a bow', () => {
    const player = new Player(context, new Position(0, 0), false);
    const wand = player.inventory.find(item => item instanceof Wand) as Wand;
    const bow = new Bow(context);
    const mpBefore = player.mp;

    player.wisdom = 18;
    player.equipment.weapon = wand;
    const wandDice = player.getDamageDice();
    const wandBonus = player.getDamageBonus();

    player.dexterity = 18;
    player.equipment.weapon = bow;

    expect(wand.isRanged).toBe(true);
    expect(wand.usesMagicForBasicAttack).toBe(true);
    expect(wandDice + wandBonus).toBeLessThan(player.getDamageDice() + player.getDamageBonus());
    expect(player.mp).toBe(mpBefore);
  });

  it('keeps every wand bolt weaker than a matching bow attack', () => {
    const player = new Player(context, new Position(0, 0), false);
    const wands = [
      new Wand(context),
      new CinderWand(context),
      new RimeWand(context),
      new SerpentWand(context),
    ];
    player.wisdom = 18;
    player.dexterity = 18;
    player.equipment.weapon = new Bow(context);
    const bowAverage = (player.getDamageDice() + 1) / 2 + player.getDamageBonus();

    for (const wand of wands) {
      player.equipment.weapon = wand;
      const wandAverage = (player.getDamageDice() + 1) / 2 + player.getDamageBonus();
      expect(wand.isRanged).toBe(true);
      expect(wandAverage).toBeLessThan(bowAverage);
      expect(restoreItem(context, wand.toSaveData())).toBeInstanceOf(wand.constructor);
    }

    expect(wands.map(wand => wand.stats.basicDamageType)).toEqual([
      'arcane', 'fire', 'frost', 'poison',
    ]);
  });

  it('uses transparent reduced magic rolls and Wisdom-scaled fallback bolts', () => {
    const player = new Player(context, new Position(0, 0), false);
    const wand = new Wand(context);
    player.wisdom = 22;
    player.equipment.weapon = wand;

    expect([
      wand.stats.magicRoll,
      new CinderWand(context).stats.magicRoll,
      new RimeWand(context).stats.magicRoll,
      new SerpentWand(context).stats.magicRoll,
      new Staff(context).stats.magicRoll,
    ]).toEqual([1, 1, 3, 2, 4]);
    expect(player.getDamageBonus()).toBe(4);
  });

  it('gives ranged attacks one damage bonus per three Dexterity above ten', () => {
    const player = new Player(context, new Position(0, 0), false);
    player.dexterity = 19;
    player.equipment.weapon = new Bow(context);

    expect(player.getDamageBonus()).toBe(4);
  });

  it('scales ordinary monster health by depth without inflating boss adds', () => {
    const finalLevel = {levelNo: 3} as Level;

    expect(new BloodBat(context, finalLevel, new Position(0, 0)).getMaxHp()).toBe(18);
    expect(new Skeleton(context, finalLevel, new Position(0, 0)).getMaxHp()).toBe(56);
    expect(new FlameCinderling(context, finalLevel, new Position(0, 0)).getMaxHp()).toBe(28);
  });
});

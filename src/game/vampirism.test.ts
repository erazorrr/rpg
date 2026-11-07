jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {restoreItem} from './items/item.factory';
import {LifeDrainScroll} from './items/scrolls/life-drain.scroll';
import {Level} from './level';
import {VampiricMonsterModifier} from './monster-modifiers/vampiric';
import {restoreMonsterModifier} from './monster-modifiers/monster-modifier.factory';
import {BloodBat} from './monsters/blood-bat';
import {CaveLeech} from './monsters/cave-leech';
import {Goblin} from './monsters/goblin';
import {restoreNpc} from './monsters/npc.factory';
import {Vampire} from './monsters/vampire';
import {Player} from './player';
import {LifeDrainSpell} from './spells/life-drain';
import {restoreSpell} from './spells/spell.factory';
import {FloorTile} from './tiles/floor.tile';

type TestWorld = {context: Context; level: Level; player: Player; messages: string[]};

function createWorld(): TestWorld {
  const holder: Partial<TestWorld> = {};
  const messages: string[] = [];
  const context: Context = {
    getPlayer: () => holder.player!,
    getCurrentMap: () => holder.level!.map,
    postGameMessage: () => {},
    getRenderer: () => null!,
    tick: () => {},
    getIsFree: () => true,
    getCharacter: () => undefined,
    getItem: () => undefined,
    buildPath: () => [],
    log: message => messages.push(message),
    destroyNpc: () => {},
    getCurrentGameLevel: () => holder.level!,
  };
  const tiles = Array.from({length: 5}, () => Array.from({length: 5}, () => new FloorTile()));
  const map = new GameMap(context, tiles, new Position(1, 1), 5, 5, 80, 24);
  const level = new Level(2, map);
  const player = new Player(context, new Position(1, 1), false);
  Object.assign(holder, {context, level, player, messages});
  return holder as TestWorld;
}

describe('vampirism', () => {
  afterEach(() => jest.restoreAllMocks());

  it('heals for half the actual Life Drain damage without spreading blood', () => {
    const {context, level, player, messages} = createWorld();
    const target = new CaveLeech(context, level, new Position(2, 1));
    player.hp = 10;
    target.hp = target.getMaxHp();
    const targetHpBefore = target.getHp();
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    target.applySpell(player, new LifeDrainSpell());

    const damageDealt = targetHpBefore - target.getHp();
    const healthDrained = Math.ceil(damageDealt / 2);
    expect(damageDealt).toBeGreaterThan(0);
    expect(player.getHp()).toBe(10 + healthDrained);
    expect(level.map.getTile(target.position)!.getIsBloody()).toBe(false);
    expect(messages).toContain(`Hero drains ${healthDrained} health.`);
  });

  it('lets the modifier drain half the damage from an ordinary attack', () => {
    const {context, level, player} = createWorld();
    const goblin = new Goblin(context, level, new Position(2, 1));
    goblin.applyModifier(new VampiricMonsterModifier());
    goblin.hp = 1;
    const playerHpBefore = player.getHp();
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    goblin.attack(player);

    const damageDealt = playerHpBefore - player.getHp();
    expect(damageDealt).toBeGreaterThan(0);
    expect(goblin.getHp()).toBe(1 + Math.ceil(damageDealt / 2));
  });

  it('restores all persistent vampiric content from stable IDs', () => {
    const {context, level} = createWorld();
    const monsters = [
      new CaveLeech(context, level, new Position(1, 2)),
      new BloodBat(context, level, new Position(2, 2)),
      new Vampire(context, level, new Position(3, 2)),
    ];

    expect(restoreNpc(context, level, monsters[0].toSaveData())).toBeInstanceOf(CaveLeech);
    expect(restoreNpc(context, level, monsters[1].toSaveData())).toBeInstanceOf(BloodBat);
    expect(restoreNpc(context, level, monsters[2].toSaveData())).toBeInstanceOf(Vampire);
    expect(restoreSpell(LifeDrainSpell.saveId)).toBeInstanceOf(LifeDrainSpell);
    const scroll = new LifeDrainScroll(context);
    expect(restoreItem(context, scroll.toSaveData())).toBeInstanceOf(LifeDrainScroll);
    expect(restoreMonsterModifier(VampiricMonsterModifier.saveId)).toBeInstanceOf(VampiricMonsterModifier);
  });

  it('gives each creature the agreed tactical profile', () => {
    const {context, level} = createWorld();
    const leech = new CaveLeech(context, level, new Position(1, 2));
    const bat = new BloodBat(context, level, new Position(2, 2));
    const vampire = new Vampire(context, level, new Position(3, 2));

    expect(leech.getSpeed()).toBe(1);
    expect(bat.getSpeed()).toBe(3);
    expect(bat.getCowardice()).toBe(.4);
    expect(vampire.getSpellLogic().attack[0]).toBeInstanceOf(LifeDrainSpell);
    expect([leech, bat, vampire].every(monster => monster.getLifeStealPercent() === .5)).toBe(true);
  });
});

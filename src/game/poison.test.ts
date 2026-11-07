jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {ForegroundColor} from '../io/foreground.color';
import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {restoreItem} from './items/item.factory';
import {AntidotePotion} from './items/potions/antidote';
import {PurgePoisonScroll} from './items/scrolls/purge-poison.scroll';
import {VenomousTouchScroll} from './items/scrolls/venomous-touch.scroll';
import {Level} from './level';
import {AshenSkeleton} from './monsters/ashen-skeleton';
import {BloodBat} from './monsters/blood-bat';
import {CaveAsp} from './monsters/cave-asp';
import {EmberGuardian} from './monsters/ember-guardian';
import {PhaseSpider} from './monsters/phase-spider';
import {RiftWisp} from './monsters/rift-wisp';
import {Skeleton} from './monsters/skeleton';
import {Vampire} from './monsters/vampire';
import {restoreNpc} from './monsters/npc.factory';
import {Player} from './player';
import {FireBoltSpell} from './spells/fire-bolt';
import {IceShardSpell} from './spells/ice-shard';
import {PurgePoisonSpell} from './spells/purge-poison';
import {VenomousTouchSpell} from './spells/venomous-touch';
import {restoreSpell} from './spells/spell.factory';
import {restoreState} from './state.factory';
import {BurningState} from './states/burning.state';
import {FrozenState} from './states/frozen.state';
import {PoisonedState} from './states/poisoned.state';
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
  for (const column of tiles) for (const tile of column) tile.setExplored(true);
  const map = new GameMap(context, tiles, new Position(1, 1), 5, 5, 80, 24);
  const level = new Level(1, map);
  const player = new Player(context, new Position(1, 1), false);
  Object.assign(holder, {context, level, player, messages});
  return holder as TestWorld;
}

describe('poison', () => {
  afterEach(() => jest.restoreAllMocks());

  it('deals highlighted poison damage without spreading blood', () => {
    const {level, player} = createWorld();
    const poisoned = new PoisonedState(10);
    const hpBefore = player.getHp();
    player.applyState(poisoned);

    player.tick();

    expect(player.getHp()).toBe(hpBefore - 1);
    expect(level.map.getTile(player.position)!.getIsBloody()).toBe(false);
    expect(poisoned.getForegroundColor()).toBe(ForegroundColor.GreenYellow);
  });

  it('applies Cave Asp venom only after a damaging hit', () => {
    const {context, level, player, messages} = createWorld();
    const asp = new CaveAsp(context, level, new Position(2, 1));
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(.99)
      .mockReturnValueOnce(.99)
      .mockReturnValueOnce(.99)
      .mockReturnValueOnce(.1);

    asp.attack(player);

    expect(Array.from(player.states)[0]).toBeInstanceOf(PoisonedState);
    expect(messages).toContain('Hero is poisoned!');
  });

  it('cures poison with either remedy and restores every stable ID', () => {
    const {context, level, player} = createWorld();
    player.applyState(new PoisonedState(10));
    player.applySpell(player, new PurgePoisonSpell());
    expect(player.states.size).toBe(0);

    const potion = new AntidotePotion(context);
    player.applyState(new PoisonedState(10));
    expect(player.removeState(potion.stats.consumableStateRemoval!.saveId)).toBeInstanceOf(PoisonedState);
    expect(restoreState(new PoisonedState(7).toSaveData())).toBeInstanceOf(PoisonedState);
    expect(restoreItem(context, potion.toSaveData())).toBeInstanceOf(AntidotePotion);
    expect(restoreItem(context, new PurgePoisonScroll(context).toSaveData())).toBeInstanceOf(PurgePoisonScroll);
    expect(restoreSpell(PurgePoisonSpell.saveId)).toBeInstanceOf(PurgePoisonSpell);

    const asp = new CaveAsp(context, level, new Position(2, 1));
    expect(restoreNpc(context, level, asp.toSaveData())).toBeInstanceOf(CaveAsp);
    expect(new PhaseSpider(context, level, new Position(3, 1)).saveId).toBe(PhaseSpider.saveId);
  });

  it('casts Venomous Touch only at touch range and poisons living targets', () => {
    const {context, level, player} = createWorld();
    const target = new CaveAsp(context, level, new Position(2, 1));
    const spell = new VenomousTouchSpell();
    const hpBefore = target.getHp();
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    target.applySpell(player, spell);

    expect(spell.stats.range).toBe(1);
    expect(spell.getMPCost()).toBe(4);
    expect(target.getHp()).toBeLessThan(hpBefore);
    expect(Array.from(target.states)[0]).toBeInstanceOf(PoisonedState);
    expect(level.map.getTile(target.position)!.getIsBloody()).toBe(false);
    expect(restoreSpell(VenomousTouchSpell.saveId)).toBeInstanceOf(VenomousTouchSpell);
    expect(restoreItem(context, new VenomousTouchScroll(context).toSaveData())).toBeInstanceOf(VenomousTouchScroll);
  });

  it('logs one poison immunity message and makes the whole touch ineffective', () => {
    const {context, level, player, messages} = createWorld();
    const skeleton = new Skeleton(context, level, new Position(2, 1));
    const hpBefore = skeleton.getHp();
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    skeleton.applySpell(player, new VenomousTouchSpell());

    expect(skeleton.getHp()).toBe(hpBefore);
    expect(skeleton.states.size).toBe(0);
    expect(messages.filter(message => message === 'Skeleton is immune to poison!')).toHaveLength(1);
  });

  it('uses the agreed condition immunity matrix while preserving elemental damage', () => {
    const {context, level, player, messages} = createWorld();
    const ashen = new AshenSkeleton(context, level, new Position(2, 1));
    const wisp = new RiftWisp(context, level, new Position(3, 1));
    const guardian = new EmberGuardian(context, level, new Position(2, 2));
    const vampire = new Vampire(context, level, new Position(3, 2));

    expect(ashen.applyState(new PoisonedState(10))).toBe(false);
    expect(ashen.applyState(new BurningState(10, 1))).toBe(false);
    expect(ashen.applyState(new FrozenState(10))).toBe(true);
    expect(wisp.applyState(new BurningState(10, 1))).toBe(false);
    expect(wisp.applyState(new FrozenState(10))).toBe(false);
    expect(guardian.applyState(new PoisonedState(10))).toBe(false);
    expect(guardian.applyState(new BurningState(10, 1))).toBe(false);
    expect(guardian.applyState(new FrozenState(10))).toBe(true);
    expect(vampire.applyState(new PoisonedState(10))).toBe(false);

    const ashenHp = ashen.getHp();
    const wispHp = wisp.getHp();
    jest.spyOn(Math, 'random').mockReturnValue(.99);
    ashen.applySpell(player, new FireBoltSpell());
    wisp.applySpell(player, new IceShardSpell());
    expect(ashen.getHp()).toBeLessThan(ashenHp);
    expect(wisp.getHp()).toBeLessThan(wispHp);
    expect(messages).toContain('Ashen skeleton cannot burn!');
    expect(messages).toContain('Rift wisp cannot be frozen!');
  });

  it('does not spread blood from direct fire or frost damage', () => {
    const {context, level, player} = createWorld();
    const fireTarget = new CaveAsp(context, level, new Position(2, 1));
    const frostTarget = new BloodBat(context, level, new Position(3, 1));
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    fireTarget.applySpell(player, new FireBoltSpell());
    frostTarget.applySpell(player, new IceShardSpell());

    expect(level.map.getTile(fireTarget.position)!.getIsBloody()).toBe(false);
    expect(level.map.getTile(frostTarget.position)!.getIsBloody()).toBe(false);
  });
});

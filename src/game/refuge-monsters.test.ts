jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Position} from '../io/position';
import {ProjectilePresentation} from './animation';
import {Context} from './context';
import {GameMap} from './game.map';
import {Level} from './level';
import {KoboldHookBearer} from './monsters/kobold-hook-bearer';
import {KoboldSalvekeeper} from './monsters/kobold-salvekeeper';
import {KoboldTunnelGuard} from './monsters/kobold-tunnel-guard';
import {GnomeWarlock} from './monsters/gnome-warlock';
import {BoundFamiliar} from './monsters/bound-familiar';
import {WarmthFountain} from './monsters/warmth-fountain';
import {RimeProjector} from './monsters/rime-projector';
import {EmberTurret} from './monsters/ember-turret';
import {restoreNpc} from './monsters/npc.factory';
import {Skeleton} from './monsters/skeleton';
import {Action} from './npc';
import {Player} from './player';
import {FloorTile} from './tiles/floor.tile';
import {FrozenState} from './states/frozen.state';
import {CaveAsp} from './monsters/cave-asp';

function createWorld(width = 9, height = 9): {
  context: Context;
  level: Level;
  player: Player;
  projectiles: ProjectilePresentation[];
  messages: string[];
} {
  const world: {level?: Level; player?: Player} = {};
  const projectiles: ProjectilePresentation[] = [];
  const messages: string[] = [];
  const context: Context = {
    getPlayer: () => world.player!,
    getCurrentMap: () => world.level!.map,
    postGameMessage: () => {},
    getRenderer: () => null!,
    tick: () => {},
    getIsFree: position =>
      !position.equals(world.player!.position) && !world.level!.getNpcAt(position),
    getCharacter: position => {
      if (position.equals(world.player!.position)) return world.player;
      return world.level!.getNpcAt(position) ?? undefined;
    },
    getItem: () => undefined,
    buildPath: () => [],
    log: message => messages.push(message),
    destroyNpc: npc => world.level!.removeNpc(npc as never),
    getCurrentGameLevel: () => world.level!,
    presentProjectile: projectile => projectiles.push(projectile),
  };
  const tiles = Array.from({length: width}, () =>
    Array.from({length: height}, () => new FloorTile())
  );
  const map = new GameMap(context, tiles, new Position(0, 0), width, height, 80, 24);
  const level = new Level(2, map);
  const player = new Player(context, new Position(width - 2, Math.floor(height / 2)), false);
  world.level = level;
  world.player = player;
  return {context, level, player, projectiles, messages};
}

describe('Emberdeep refuge monsters', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lets a kobold hook-bearer pull the Hero up to three cardinal tiles', () => {
    const {context, level, player} = createWorld();
    const hookBearer = new KoboldHookBearer(context, level, new Position(1, player.position.y));
    level.putNpc(hookBearer);
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    hookBearer.tick();

    expect(player.position).toEqual(new Position(4, 4));
  });

  it('spends one of the salvekeeper\'s three charges to heal an ally', () => {
    const {context, level, player} = createWorld();
    const healer = new KoboldSalvekeeper(context, level, new Position(3, player.position.y));
    const guard = new KoboldTunnelGuard(context, level, new Position(4, player.position.y));
    guard.hp -= 10;
    healer.restorePreviousAction(Action.Attack);
    level.putNpc(healer);
    level.putNpc(guard);

    healer.tick();

    expect(guard.getHp()).toBe(guard.getMaxHp() - 2);
    expect(healer.toSaveData().healer?.charges).toBe(2);
  });

  it('caps a warlock at two familiars and unbinds them when the warlock dies', () => {
    const {context, level} = createWorld();
    const warlock = new GnomeWarlock(context, level, new Position(4, 4), 'test-warlock');
    level.putNpc(warlock);

    warlock.tick();
    warlock.tick();
    warlock.tick();
    expect(level.getNpcs().filter(npc => npc instanceof BoundFamiliar)).toHaveLength(2);

    warlock.damage(999);
    expect(level.getNpcs().filter(npc => npc instanceof BoundFamiliar)).toHaveLength(0);
  });

  it('makes an indestructible fountain heal nearby living creatures only', () => {
    const {context, level, player} = createWorld();
    const fountain = new WarmthFountain(context, level, new Position(5, 4));
    const guard = new KoboldTunnelGuard(context, level, new Position(5, 3));
    const skeleton = new Skeleton(context, level, new Position(5, 5));
    skeleton.hp = skeleton.getMaxHp();
    player.hp -= 2;
    guard.hp -= 2;
    skeleton.hp -= 2;
    level.putNpc(fountain);
    level.putNpc(guard);
    level.putNpc(skeleton);

    fountain.tick();

    expect(player.getHp()).toBe(player.getMaxHp() - 1);
    expect(guard.getHp()).toBe(guard.getMaxHp() - 1);
    expect(skeleton.getHp()).toBe(skeleton.getMaxHp() - 2);
    expect(fountain.damage(999)).toBe(0);
  });

  it('animates a fixed Rime projector lane and freezes its first target', () => {
    const {context, level, player, projectiles, messages} = createWorld();
    const projector = new RimeProjector(context, level, new Position(player.position.x, 1));
    level.putNpc(projector);

    for (let i = 0; i < 4; i++) projector.tick();

    expect(Array.from(player.states).some(state => state instanceof FrozenState)).toBe(true);
    expect(projectiles).toHaveLength(4);
    expect(projectiles.some(projectile => projectile.impact === 'hit')).toBe(true);
    expect(messages).toContain('Hero froze!');
  });

  it('does not report an unseen Cave asp freezing or thawing', () => {
    const {context, level, player, messages} = createWorld(80, 5);
    const projector = new RimeProjector(context, level, new Position(10, player.position.y));
    const asp = new CaveAsp(context, level, new Position(12, player.position.y));
    level.putNpc(projector);
    level.putNpc(asp);

    for (let i = 0; i < 4; i++) projector.tick();
    asp.tick();
    asp.tick();

    expect(Array.from(asp.states).some(state => state instanceof FrozenState)).toBe(false);
    expect(messages).not.toContain('Cave asp froze!');
    expect(messages).not.toContain('Cave asp unfroze!');
  });

  it('lets a destructible Ember turret fire once every three turns', () => {
    const {context, level, player, projectiles} = createWorld();
    const turret = new EmberTurret(context, level, new Position(player.position.x, 1));
    level.putNpc(turret);
    jest.spyOn(Math, 'random').mockReturnValue(.99);
    const hpBefore = player.getHp();

    turret.tick();
    turret.tick();
    expect(player.getHp()).toBe(hpBefore);
    turret.tick();

    expect(player.getHp()).toBeLessThan(hpBefore);
    expect(projectiles).toHaveLength(1);
    expect(turret.damage(999)).toBeGreaterThan(0);
    expect(turret.getHp()).toBe(0);
  });

  it('round-trips the persistent data owned by new NPC types', () => {
    const {context, level} = createWorld();
    const healer = new KoboldSalvekeeper(context, level, new Position(1, 1));
    healer.restoreSalves(1);
    const warlock = new GnomeWarlock(context, level, new Position(2, 1), 'saved-warlock');
    warlock.restoreSummonsRemaining(1);
    const familiar = new BoundFamiliar(context, level, new Position(3, 1), 'saved-warlock');
    const projector = new RimeProjector(context, level, new Position(4, 1));
    projector.restoreCycle(2);
    const turret = new EmberTurret(context, level, new Position(5, 1));
    turret.restoreCycle(1);

    for (const npc of [healer, warlock, familiar, projector, turret]) {
      expect(restoreNpc(context, level, npc.toSaveData()).toSaveData()).toMatchObject(npc.toSaveData());
    }
  });
});

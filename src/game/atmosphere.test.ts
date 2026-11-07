jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {Level} from './level';
import {Player} from './player';
import {FloorTile} from './tiles/floor.tile';
import {Goblin} from './monsters/goblin';
import {WallTile} from './tiles/wall.tile';
import {SkeletonArcher} from './monsters/skeleton-archer';

function world() {
  const holder: {level?: Level; player?: Player} = {};
  const context: Context = {
    getPlayer: () => holder.player!,
    getCurrentMap: () => holder.level!.map,
    postGameMessage: () => {},
    getRenderer: () => null!,
    tick: () => {},
    getIsFree: () => true,
    getCharacter: position => holder.level?.getNpcAt(position) ?? undefined,
    getItem: () => undefined,
    buildPath: () => [],
    log: () => {},
    destroyNpc: () => {},
    getCurrentGameLevel: () => holder.level!,
  };
  const map = new GameMap(
    context,
    Array.from({length: 7}, () => Array.from({length: 3}, () => new FloorTile())),
    new Position(1, 1),
    7,
    3,
    7,
    3,
  );
  holder.level = new Level(1, map);
  holder.player = new Player(context, new Position(1, 1), false);
  return {level: holder.level, player: holder.player, context} as {level: Level; player: Player; context: Context};
}

describe('atmosphere', () => {
  it('blocks sight through a cell and conceals an occupant in a cell', () => {
    const {level, player} = world();
    level.putAtmosphere(new Position(3, 1), {
      kind: 'smoke', turnsLeft: 5, density: 3, drift: 'right', driftIn: 2,
    }, false);
    expect(player.isVisible(new Position(5, 1))).toBeNull();
    expect(player.isVisible(new Position(3, 1))).toBeNull();
    expect(player.canSeeTerrain(new Position(3, 1))).toBe(true);
  });

  it('allows cardinally adjacent sight from inside smoke', () => {
    const {level, player} = world();
    level.putAtmosphere(player.position, {
      kind: 'smoke', turnsLeft: 5, density: 3, drift: 'right', driftIn: 2,
    }, false);
    expect(player.isVisible(player.position.right())).not.toBeNull();
    expect(player.canSeeTerrain(player.position.up())).toBe(true);
    expect(player.isVisible(player.position.shift(2, 0))).toBeNull();
  });

  it('prevents a non-adjacent archer from attacking a target in smoke', () => {
    const {level, player, context} = world();
    const archer = new SkeletonArcher(context, level, new Position(5, 1));
    level.putNpc(archer);
    level.putAtmosphere(player.position, {
      kind: 'smoke', turnsLeft: 5, density: 3, drift: 'right', driftIn: 2,
    }, false);
    expect(archer.isVisible(player.position)).toBeNull();
    expect(archer.canAttack(player.position)).toBe(false);
  });

  it('does not let characters carve holes in explored-room visibility', () => {
    const {level, player, context} = world();
    level.putNpc(new Goblin(context, level, new Position(3, 1)));
    expect(player.isVisible(new Position(5, 1))).not.toBeNull();
    expect(player.canSeeTerrain(new Position(5, 1))).toBe(true);
  });

  it('makes corner visibility reciprocal', () => {
    const {level, player, context} = world();
    const goblin = new Goblin(context, level, new Position(3, 2));
    level.putNpc(goblin);
    level.map.setTile(new Position(2, 1), new WallTile());
    expect(player.isVisible(goblin.position)).toBeNull();
    expect(goblin.isVisible(player.position)).toBeNull();
  });

  it('does not expose a character standing on unexplored dungeon terrain', () => {
    const {level, player, context} = world();
    const goblin = new Goblin(context, level, new Position(3, 1));
    level.putNpc(goblin);

    expect(player.isVisible(goblin.position)).not.toBeNull();
    expect(player.canSeeCharacter(goblin)).toBe(false);
    level.map.getTile(goblin.position)!.setExplored(true);
    expect(player.canSeeCharacter(goblin)).toBe(true);
  });

  it('does not move a fresh cell, then drifts it simultaneously', () => {
    const {level} = world();
    level.putAtmosphere(new Position(2, 1), {
      kind: 'steam', turnsLeft: 3, density: 2, drift: 'right', driftIn: 1,
    });
    level.tickAtmosphere();
    expect(level.getAtmosphere(new Position(2, 1))?.turnsLeft).toBe(3);
    level.tickAtmosphere();
    expect(level.getAtmosphere(new Position(2, 1))).toBeUndefined();
    expect(level.getAtmosphere(new Position(3, 1))?.turnsLeft).toBe(2);
  });
});

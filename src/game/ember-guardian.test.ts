jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {Level} from './level';
import {EmberGuardian} from './monsters/ember-guardian';
import {FlameCinderling} from './monsters/flame-cinderling';
import {RimeCinderling} from './monsters/rime-cinderling';
import {Player} from './player';
import {FloorTile} from './tiles/floor.tile';

describe('Ember Guardian', () => {
  it('begins at full boss health and releases its two cinderling waves', () => {
    const messages: string[] = [];
    const world: {level?: Level; player?: Player} = {};
    const context: Context = {
      getPlayer: () => world.player!,
      getCurrentMap: () => world.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: position => !position.equals(world.player!.position) && !world.level!.getNpcAt(position),
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: message => messages.push(message),
      destroyNpc: () => {},
      getCurrentGameLevel: () => world.level!,
    };
    const tiles = Array.from(
      {length: 7},
      () => Array.from({length: 7}, () => new FloorTile()),
    );
    for (const column of tiles) for (const tile of column) tile.setExplored(true);
    const map = new GameMap(context, tiles, new Position(0, 0), 7, 7, 80, 24);
    const level = new Level(3, map);
    const player = new Player(context, new Position(0, 0), false);
    const guardian = new EmberGuardian(context, level, new Position(3, 3));
    world.level = level;
    world.player = player;
    level.putNpc(guardian);

    expect(guardian.getMaxHp()).toBe(120);
    expect(guardian.getHp()).toBe(120);

    guardian.damage(41);
    expect(level.getNpcs().filter(npc => npc instanceof FlameCinderling)).toHaveLength(2);
    expect(level.getNpcs().filter(npc => npc instanceof RimeCinderling)).toHaveLength(0);

    guardian.damage(40);
    expect(level.getNpcs().filter(npc => npc instanceof FlameCinderling)).toHaveLength(2);
    expect(level.getNpcs().filter(npc => npc instanceof RimeCinderling)).toHaveLength(2);
    expect(messages).toEqual([
      'The Guardian\'s shell splits, spilling living flame!',
      'Cold flashes through the widening cracks. Rime cinderlings break free!',
    ]);
  });
});

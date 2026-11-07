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
import {DexterityMonsterModifier} from './monster-modifiers/dexterity';
import {EnduranceMonsterModifier} from './monster-modifiers/endurance';
import {GoblinMage} from './monsters/goblin-mage';
import {OgreMage} from './monsters/ogre-mage';
import {Action} from './npc';
import {Player} from './player';
import {FloorTile} from './tiles/floor.tile';

describe('Npc alert behavior', () => {
  it('stops casting and becomes passive after checking the last seen position', () => {
    const messages: string[] = [];
    const world: {player?: Player; level?: Level} = {};
    const context: Context = {
      getPlayer: () => world.player!,
      getCurrentMap: () => world.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: () => true,
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: message => messages.push(message),
      destroyNpc: () => {},
      getCurrentGameLevel: () => world.level!,
    };
    const tiles = Array.from(
      {length: 5},
      () => Array.from({length: 5}, () => new FloorTile()),
    );
    const map = new GameMap(context, tiles, new Position(0, 0), 5, 5, 80, 24);
    const level = new Level(1, map);
    const player = new Player(context, new Position(0, 0), false);
    const mage = new OgreMage(context, level, new Position(4, 4));
    world.player = player;
    world.level = level;
    level.putNpc(mage);
    mage.restorePreviousAction(Action.Attack);
    mage.restoreLastSeenPlayerPosition(mage.position);
    jest.spyOn(mage, 'isVisible').mockImplementation(position =>
      position.equals(mage.position) ? [mage.position] : null,
    );

    mage.tick();

    expect(mage.getPreviousAction()).toBe(Action.Nothing);
    expect(mage.states.size).toBe(0);
    expect(messages).toEqual([]);
  });
});

describe('Npc XP rewards', () => {
  it('rounds the modified reward to a whole XP value', () => {
    const context = {} as Context;
    const level = {} as Level;
    const npc = new GoblinMage(context, level, new Position(0, 0));
    npc.applyModifier(new DexterityMonsterModifier());
    npc.applyModifier(new EnduranceMonsterModifier());

    expect(npc.getMaxHp()).toBe(12);
    expect(npc.getXp() * npc.getMultiplier()).toBe(393.75);
    expect(npc.getXpReward()).toBe(394);
  });
});

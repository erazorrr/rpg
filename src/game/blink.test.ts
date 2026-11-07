jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {Level} from './level';
import {Player} from './player';
import {BlinkSpell} from './spells/blink';
import {restoreSpell} from './spells/spell.factory';
import {BlinkScroll} from './items/scrolls/blink.scroll';
import {restoreItem} from './items/item.factory';
import {FloorTile} from './tiles/floor.tile';
import {WallTile} from './tiles/wall.tile';
import {StairsDownTile} from './tiles/stairs-down.tile';
import {DeepEmberTile} from './tiles/deep-ember.tile';

describe('Blink', () => {
  it('teleports to a free ordinary tile in range', () => {
    const origin = new Position(3, 3);
    const destination = new Position(5, 3);
    const occupied = new Position(4, 3);
    const messages: string[] = [];
    const holder: {player?: Player; level?: Level} = {};
    const context: Context = {
      getPlayer: () => holder.player!,
      getCurrentMap: () => holder.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: position => !position.equals(occupied),
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: message => messages.push(message),
      destroyNpc: () => {},
      getCurrentGameLevel: () => holder.level!,
    };
    const tiles = Array.from(
      {length: 7},
      () => Array.from({length: 7}, () => new WallTile()),
    );
    tiles[origin.x][origin.y] = new FloorTile();
    tiles[destination.x][destination.y] = new FloorTile();
    tiles[occupied.x][occupied.y] = new FloorTile();
    tiles[2][3] = new StairsDownTile();
    tiles[3][2] = new DeepEmberTile();
    const map = new GameMap(context, tiles, origin, 7, 7, 7, 7);
    holder.level = new Level(1, map);
    holder.player = new Player(context, origin, false);

    holder.player.applySpell(holder.player, new BlinkSpell());

    expect(holder.player.position).toEqual(destination);
    expect(messages).toEqual(['Hero blinks away!']);
  });

  it('restores from its stable save ID', () => {
    expect(restoreSpell(BlinkSpell.saveId)).toBeInstanceOf(BlinkSpell);
    const context = {} as Context;
    const scroll = new BlinkScroll(context);
    expect(restoreItem(context, scroll.toSaveData())).toBeInstanceOf(BlinkScroll);
  });
});

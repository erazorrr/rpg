jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMessage, GameMessageType} from './game-message';
import {ChampionStrength} from './item-modifiers/champion-strength';
import {ShortSword} from './items/weapons/short-sword';
import {Player} from './player';
import {LootChestTile} from './tiles/loot-chest.tile';
import {restoreTile} from './tiles/tile.factory';

describe('loot chests', () => {
  it('round-trips rarity and remaining contents and stays blocking when empty', () => {
    const context = {} as Context;
    const chest = new LootChestTile('gilded', [
      new ShortSword(context).applyModifier(new ChampionStrength()),
    ]);
    chest.setExplored(true);
    const restored = restoreTile(chest.toSaveData(), context) as LootChestTile;

    expect(restored.rarity).toBe('gilded');
    expect(restored.getItems()[0].getModifiers()[0].saveId).toBe(ChampionStrength.saveId);
    expect(restored.takeItem(0)).toBeInstanceOf(ShortSword);
    expect(restored.getItems()).toHaveLength(0);
    expect(restored.isNavigable()).toBe(false);
    expect(restored.getBaseChar().char).toBe('C');
  });

  it('opens when bumped without moving or consuming a turn', () => {
    const origin = new Position(0, 0);
    const target = new Position(1, 0);
    const chest = new LootChestTile('sturdy', []);
    const messages: GameMessage[] = [];
    const tick = jest.fn();
    const context = {
      getCharacter: () => undefined,
      getCurrentMap: () => ({
        isNavigable: () => false,
        getTile: (position: Position) => position.equals(target) ? chest : undefined,
      }),
      postGameMessage: (message: GameMessage) => messages.push(message),
      recordEvent: () => {},
      tick,
    } as unknown as Context;
    const player = new Player(context, origin, false);

    (player as unknown as {moveTo(position: Position): void}).moveTo(target);

    expect(player.position).toEqual(origin);
    expect(tick).not.toHaveBeenCalled();
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe(GameMessageType.OpenLootChest);
    expect((messages[0].payload as {chest: LootChestTile}).chest).toBe(chest);
    expect((messages[0].payload as {position: Position}).position).toEqual(target);
  });
});

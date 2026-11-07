jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Position} from "../io/position";
import {Context} from "./context";
import {restoreItem} from "./items/item.factory";
import {ThawPotion} from "./items/potions/thaw";
import {ThawScroll} from "./items/scrolls/thaw.scroll";
import {LootGenerator} from "./loot-generator";
import {Player} from "./player";
import {restoreSpell} from "./spells/spell.factory";
import {ThawSpell} from "./spells/thaw";
import {FrozenState} from "./states/frozen.state";

describe('thaw cures', () => {
  let currentPlayer: Player;
  const context = {
    log: jest.fn(),
    getPlayer: () => currentPlayer,
  } as unknown as Context;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes Frozen when cast on the player', () => {
    const player = new Player(context, new Position(0, 0), false);
    currentPlayer = player;
    player.applyState(new FrozenState(10));

    player.applySpell(player, new ThawSpell());

    expect(Array.from(player.states)).toHaveLength(0);
    expect(context.log).toHaveBeenCalledWith('Hero unfroze!');
  });

  it('lets a thaw potion identify and remove Frozen', () => {
    const player = new Player(context, new Position(0, 0), false);
    currentPlayer = player;
    const potion = new ThawPotion(context);
    player.applyState(new FrozenState(10));

    const removed = player.removeState(potion.stats.consumableStateRemoval!.saveId);

    expect(removed).toBeInstanceOf(FrozenState);
    expect(Array.from(player.states)).toHaveLength(0);
  });

  it('restores the potion, scroll, and learned spell by stable save ID', () => {
    expect(restoreItem(context, {kind: ThawPotion.saveId, modifiers: []})).toBeInstanceOf(ThawPotion);
    expect(restoreItem(context, {kind: ThawScroll.saveId, modifiers: []})).toBeInstanceOf(ThawScroll);
    expect(restoreSpell(ThawSpell.saveId)).toBeInstanceOf(ThawSpell);
  });

  it('offers both cures from cost-4 loot before skeleton mages appear', () => {
    const loot = LootGenerator.getLoot(4);

    expect(loot['Thaw Potion (Cures Frozen)']).toBeGreaterThan(0);
    expect(loot['Scroll of Thaw']).toBeGreaterThan(0);
  });
});

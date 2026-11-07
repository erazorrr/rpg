jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {BackgroundColor} from '../io/background.color';
import {ForegroundColor} from '../io/foreground.color';
import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {restoreItem} from './items/item.factory';
import {InvisibilityScroll} from './items/scrolls/invisibility.scroll';
import {Level} from './level';
import {Goblin} from './monsters/goblin';
import {Vampire} from './monsters/vampire';
import {Action} from './npc';
import {Player} from './player';
import {FireBoltSpell} from './spells/fire-bolt';
import {InvisibilitySpell} from './spells/invisibility';
import {restoreSpell} from './spells/spell.factory';
import {restoreState} from './state.factory';
import {FrozenState} from './states/frozen.state';
import {InvisibilityState} from './states/invisibility.state';
import {PoisonedState} from './states/poisoned.state';
import {VeilFatigueState} from './states/veil-fatigue.state';
import {FloorTile} from './tiles/floor.tile';

type TestWorld = {
  context: Context;
  level: Level;
  player: Player;
  put: jest.Mock;
  messages: string[];
};

function createWorld(width = 20): TestWorld {
  const holder: Partial<TestWorld> = {};
  const messages: string[] = [];
  const put = jest.fn();
  const context: Context = {
    getPlayer: () => holder.player!,
    getCurrentMap: () => holder.level!.map,
    postGameMessage: () => {},
    getRenderer: () => ({put}) as never,
    tick: () => {},
    getIsFree: () => true,
    getCharacter: () => undefined,
    getItem: () => undefined,
    buildPath: () => [],
    log: message => messages.push(message),
    destroyNpc: () => {},
    getCurrentGameLevel: () => holder.level!,
  };
  const tiles = Array.from({length: width}, () => Array.from({length: 5}, () => new FloorTile()));
  for (const column of tiles) for (const tile of column) tile.setExplored(true);
  const map = new GameMap(context, tiles, new Position(1, 1), width, 5, 80, 24);
  const level = new Level(3, map);
  const player = new Player(context, new Position(1, 1), false);
  Object.assign(holder, {context, level, player, put, messages});
  return holder as TestWorld;
}

describe('invisibility', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lasts ten turns, costs twenty MP, and restores from stable IDs', () => {
    const {context, player} = createWorld();
    const spell = new InvisibilitySpell();
    player.applySpell(player, spell);

    expect(spell.keyBinding).toBe('i');
    expect(spell.getMPCost()).toBe(20);
    expect(player.isInvisible()).toBe(true);
    for (let turn = 0; turn < 9; turn++) player.tick();
    expect(player.isInvisible()).toBe(true);
    player.tick();
    expect(player.isInvisible()).toBe(false);

    expect(restoreSpell(InvisibilitySpell.saveId)).toBeInstanceOf(InvisibilitySpell);
    expect(restoreItem(context, new InvisibilityScroll(context).toSaveData())).toBeInstanceOf(InvisibilityScroll);
    expect(restoreState(new InvisibilityState(7).toSaveData())).toBeInstanceOf(InvisibilityState);
    expect(restoreState(new VeilFatigueState(12).toSaveData())).toBeInstanceOf(VeilFatigueState);
  });

  it('keeps the Hero invisible through attacking, spellcasting, and damage', () => {
    const {context, level, player, messages} = createWorld();
    const goblin = new Goblin(context, level, new Position(2, 1));
    player.applyState(new InvisibilityState(10));
    jest.spyOn(Math, 'random').mockReturnValue(.99);

    player.attack(goblin);
    goblin.applySpell(player, new FireBoltSpell());
    goblin.attack(player);

    expect(player.isInvisible()).toBe(true);
    expect(messages.some(message => message.includes('damage'))).toBe(true);
    expect(goblin.getPreviousAction()).toBe(Action.Attack);
    expect(goblin.toSaveData().lastSeenPlayerPosition).toEqual(player.position);
  });

  it('hides characters from sight-based targeting without blocking line of sight', () => {
    const {context, level, player} = createWorld();
    const goblin = new Goblin(context, level, new Position(3, 1));
    goblin.applyState(new InvisibilityState(10));

    expect(player.isVisible(goblin.position)).not.toBeNull();
    expect(player.canSeeCharacter(goblin)).toBe(false);
  });

  it('renders an invisible Hero in pale cyan while preserving condition backgrounds', () => {
    const {player, put} = createWorld();
    player.applyState(new InvisibilityState(10));
    player.applyState(new PoisonedState(10));
    player.applyState(new FrozenState(10));

    player.render();

    expect(put).toHaveBeenCalledWith(expect.any(Position), expect.objectContaining({
      char: '@',
      color: ForegroundColor.LightCyan1,
      backgroundColor: BackgroundColor.SkyBlue1,
    }));
  });

  it('lets vampires veil only at useful distance and applies a persistent cooldown', () => {
    const {context, level} = createWorld();
    const vampire = new Vampire(context, level, new Position(5, 1));
    level.putNpc(vampire);

    vampire.tick();

    expect(vampire.isInvisible()).toBe(true);
    expect(Array.from(vampire.states).find(state => state.saveId === InvisibilityState.saveId)?.getTurnsLeft()).toBe(10);
    expect(Array.from(vampire.states).some(state => state.saveId === VeilFatigueState.saveId)).toBe(true);
    const restoredFatigue = restoreState(
      Array.from(vampire.states).find(state => state.saveId === VeilFatigueState.saveId)!.toSaveData(),
    );
    expect(restoredFatigue).toBeInstanceOf(VeilFatigueState);
  });

  it('prevents a vampire from recasting while Veil Fatigue remains', () => {
    const {context, level} = createWorld();
    const vampire = new Vampire(context, level, new Position(5, 1));
    vampire.applyState(new VeilFatigueState(12));
    level.putNpc(vampire);

    vampire.tick();

    expect(vampire.isInvisible()).toBe(false);
    expect(Array.from(vampire.states).find(state => state.saveId === VeilFatigueState.saveId)?.getTurnsLeft()).toBe(11);
  });

  it('does not waste the veil while adjacent but uses it while fleeing at long range', () => {
    const adjacentWorld = createWorld();
    const adjacent = new Vampire(adjacentWorld.context, adjacentWorld.level, new Position(2, 1));
    adjacentWorld.level.putNpc(adjacent);
    adjacent.tick();
    expect(adjacent.isInvisible()).toBe(false);

    const fleeingWorld = createWorld();
    const fleeing = new Vampire(fleeingWorld.context, fleeingWorld.level, new Position(15, 1));
    fleeingWorld.level.putNpc(fleeing);
    fleeing.restorePreviousAction(Action.Flee);
    fleeing.tick();
    expect(fleeing.isInvisible()).toBe(true);
  });
});

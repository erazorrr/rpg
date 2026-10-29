jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {GameMap} from './game.map';
import {GameSaveCodec} from './game-save-codec';
import {Strength} from './item-modifiers/strength';
import {SteelModifier} from './item-modifiers/weapon/material/steel';
import {ArmorPotion} from './items/potions/armor';
import {LongSword} from './items/weapons/long-sword';
import {Weapon} from './items/weapons/weapon';
import {Level} from './level';
import {StrengthMonsterModifier} from './monster-modifiers/strength';
import {Goblin} from './monsters/goblin';
import {TreasureGoblin} from './monsters/treasure-goblin';
import {Action} from './npc';
import {Player} from './player';
import {FireLanceSpell} from './spells/fire-lance';
import {ArmorState} from './states/armor.state';
import {BurningState} from './states/burning.state';
import {FrozenState} from './states/frozen.state';
import {FloorTile} from './tiles/floor.tile';

type World = {
  context: Context;
  player: Player;
  levels: Level[];
  currentLevelIndex: number;
};

function contextFor(world: Partial<World>): Context {
  return {
    getPlayer: () => world.player!,
    getCurrentMap: () => world.levels![world.currentLevelIndex!].map,
    postGameMessage: () => {},
    getRenderer: () => null!,
    tick: () => {},
    getIsFree: () => true,
    getCharacter: () => undefined,
    getItem: () => undefined,
    buildPath: () => [],
    log: () => {},
    destroyNpc: () => {},
    getCurrentGameLevel: () => world.levels![world.currentLevelIndex!],
  };
}

function createWorld(): World {
  const world: Partial<World> = {currentLevelIndex: 1};
  const context = contextFor(world);
  const tiles = Array.from(
    {length: 5},
    () => Array.from({length: 5}, () => new FloorTile()),
  );
  tiles[1][1].setExplored(true);
  tiles[1][1].setBloody(true);
  const map = new GameMap(
    context,
    tiles,
    new Position(1, 1),
    5,
    5,
    80,
    24,
  );
  const level = new Level(2, map);
  const previousMap = new GameMap(
    context,
    Array.from(
      {length: 5},
      () => Array.from({length: 5}, () => new FloorTile()),
    ),
    new Position(0, 0),
    5,
    5,
    80,
    24,
  );
  const player = new Player(context, new Position(1, 1), false);
  Object.assign(world, {
    context,
    player,
    levels: [new Level(1, previousMap), level],
  });

  player.level = 4;
  player.xp = 12000;
  player.strength = 17;
  player.dexterity = 14;
  player.endurance = 16;
  player.wisdom = 19;
  player.inventory = [
    new LongSword(context)
      .applyModifier(new SteelModifier())
      .applyModifier(new Strength()),
    new ArmorPotion(context),
  ];
  player.equipment = {weapon: player.inventory[0] as Weapon};
  player.states = new Set([
    new ArmorState(7, 13),
    new BurningState(4, 2),
  ]);
  player.hp = 23;
  player.mp = 31;
  player.knownSpells = new Set([new FireLanceSpell()]);

  const goblin = new Goblin(context, level, new Position(2, 2));
  goblin.applyModifier(new StrengthMonsterModifier());
  goblin.applyState(new FrozenState(3));
  goblin.restorePreviousAction(Action.Flee);
  goblin.hp = 5;
  goblin.mp = 7;
  level.putNpc(goblin);

  const treasureGoblin = new TreasureGoblin(
    context,
    level,
    new Position(3, 3),
    37,
  );
  treasureGoblin.restoreTimer(11, true);
  level.putNpc(treasureGoblin);
  level.putItem(new Position(4, 4), new ArmorPotion(context));

  return world as World;
}

describe('GameSaveCodec', () => {
  it('round-trips all gameplay state without changing it', () => {
    const codec: GameSaveCodec = new GameSaveCodec();
    const original = createWorld();
    const saved = codec.serialize(
      original.player,
      original.levels,
      original.currentLevelIndex,
    );
    const restoredWorld: Partial<World> = {currentLevelIndex: 0};
    const restored = codec.restore(contextFor(restoredWorld), saved);
    Object.assign(restoredWorld, restored);
    const savedAgain = codec.serialize(
      restored.player,
      restored.levels,
      restored.currentLevelIndex,
    );

    expect(savedAgain).toEqual(saved);
    expect(restored.player.equipment.weapon).toBe(restored.player.inventory[0]);
    expect(restored.player.position).toEqual(new Position(1, 1));
    expect(restored.player.level).toBe(4);
    expect(restored.player.xp).toBe(12000);
    expect(restored.player.strength).toBe(17);
    expect(restored.player.dexterity).toBe(14);
    expect(restored.player.endurance).toBe(16);
    expect(restored.player.wisdom).toBe(19);
    expect(restored.player.hp).toBe(23);
    expect(restored.player.mp).toBe(31);
    expect(restored.player.nextLevelXp()).toBe(25700);
    expect(restored.player.inventory.map(item => item.saveId)).toEqual([
      LongSword.saveId,
      ArmorPotion.saveId,
    ]);
    expect(Array.from(restored.player.knownSpells, spell => spell.saveId)).toEqual([
      FireLanceSpell.saveId,
    ]);
    expect(Array.from(restored.player.states, state => [
      state.saveId,
      state.getTurnsLeft(),
      state.stats,
    ])).toEqual([
      [ArmorState.saveId, 7, {armor: 13}],
      [BurningState.saveId, 4, {damagePerTurn: 2}],
    ]);

    const restoredLevel = restored.levels[1];
    expect(restored.currentLevelIndex).toBe(1);
    expect(restored.levels[0].levelNo).toBe(1);
    expect(restoredLevel.levelNo).toBe(2);
    expect(restoredLevel.map.getInitialPosition()).toEqual(new Position(1, 1));
    expect(restoredLevel.map.getTile(new Position(1, 1))?.isExplored()).toBe(true);
    expect(restoredLevel.map.getTile(new Position(1, 1))?.getIsBloody()).toBe(true);
    expect(restoredLevel.getItem(new Position(4, 4))?.saveId).toBe(ArmorPotion.saveId);

    const restoredGoblin = restoredLevel.getNpcAt(new Position(2, 2))!;
    expect(restoredGoblin.hp).toBe(5);
    expect(restoredGoblin.mp).toBe(7);
    expect(restoredGoblin.strength).toBe(12);
    expect(restoredGoblin.getPreviousAction()).toBe(Action.Flee);
    expect(restoredGoblin.getModifiers()[0].saveId).toBe(
      StrengthMonsterModifier.saveId,
    );
    expect(Array.from(restoredGoblin.states)[0].getTurnsLeft()).toBe(3);

    const restoredTreasureGoblin = restoredLevel.getNpcAt(
      new Position(3, 3),
    ) as TreasureGoblin;
    expect(restoredTreasureGoblin.getBaseLootCost()).toBe(37);
    expect(restoredTreasureGoblin.getTimer()).toBe(11);
    expect(restoredTreasureGoblin.hasTimerStarted()).toBe(true);
  });

  it('recovers progression for saves written before level was persisted', () => {
    const codec: GameSaveCodec = new GameSaveCodec();
    const saved = codec.serialize(...(() => {
      const world = createWorld();
      return [world.player, world.levels, world.currentLevelIndex] as const;
    })());
    const legacy = JSON.parse(JSON.stringify(saved));
    delete legacy.player.level;

    codec.validate(legacy);

    expect(legacy.player.level).toBe(4);
  });

  it('rejects unknown tile kinds and statue inscriptions', () => {
    const codec = new GameSaveCodec();
    const world = createWorld();
    const saved = codec.serialize(world.player, world.levels, world.currentLevelIndex);
    const unknownTile = JSON.parse(JSON.stringify(saved));
    unknownTile.levels[0].map.tiles[0][0].kind = 'unknown';
    expect(() => codec.validate(unknownTile)).toThrow('Invalid tile');

    const unknownInscription = JSON.parse(JSON.stringify(saved));
    unknownInscription.levels[0].map.tiles[0][0] = {
      kind: 'statue', explored: true, bloody: false, inscriptionId: 'unknown',
    };
    expect(() => codec.validate(unknownInscription)).toThrow('Invalid tile');
  });
});

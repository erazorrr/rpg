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
import {EnduranceMonsterModifier} from './monster-modifiers/endurance';
import {Goblin} from './monsters/goblin';
import {TreasureGoblin} from './monsters/treasure-goblin';
import {Action} from './npc';
import {Player} from './player';
import {FireLanceSpell} from './spells/fire-lance';
import {ArmorState} from './states/armor.state';
import {BurningState} from './states/burning.state';
import {FrozenState} from './states/frozen.state';
import {FloorTile} from './tiles/floor.tile';
import {EmberGuardian} from './monsters/ember-guardian';
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {PoisonedState} from './states/poisoned.state';
import {FlameCinderling} from './monsters/flame-cinderling';
import {RimeCinderling} from './monsters/rime-cinderling';
import {SurveyNotesLanternSiteSevenBook} from './items/books/books';
import {LootChestTile} from './tiles/loot-chest.tile';
import {Wolf} from './monsters/wolf';
import {KoboldSalvekeeper} from './monsters/kobold-salvekeeper';
import {GnomeWarlock} from './monsters/gnome-warlock';
import {BoundFamiliar} from './monsters/bound-familiar';
import {RimeProjector} from './monsters/rime-projector';
import {EmberTurret} from './monsters/ember-turret';
import {WarmthFountain} from './monsters/warmth-fountain';

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
  tiles[4][0] = new DeepEmberTile();
  tiles[4][1] = new LootChestTile('reinforced', [
    new LongSword(context).applyModifier(new Strength()),
    new ArmorPotion(context),
  ]);
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
    new PoisonedState(6),
  ]);
  player.hp = 23;
  player.mp = 31;
  player.knownSpells = new Set([new FireLanceSpell()]);

  const goblin = new Goblin(context, level, new Position(2, 2));
  goblin.applyModifier(new StrengthMonsterModifier());
  goblin.applyModifier(new EnduranceMonsterModifier());
  goblin.applyState(new FrozenState(3));
  goblin.restorePreviousAction(Action.Flee);
  goblin.hp = 5;
  goblin.mp = 7;
  level.putNpc(goblin);

  const burningWolf = new Wolf(context, level, new Position(0, 0));
  burningWolf.applyState(new BurningState(3, 1));
  level.putNpc(burningWolf);

  const treasureGoblin = new TreasureGoblin(
    context,
    level,
    new Position(3, 3),
    37,
  );
  treasureGoblin.restoreTimer(11, true);
  level.putNpc(treasureGoblin);
  level.putNpc(new EmberGuardian(context, level, new Position(4, 0)));
  level.putNpc(new FlameCinderling(context, level, new Position(0, 3)));
  level.putNpc(new RimeCinderling(context, level, new Position(0, 4)));
  const salvekeeper = new KoboldSalvekeeper(context, level, new Position(1, 0));
  salvekeeper.restoreSalves(1);
  level.putNpc(salvekeeper);
  const warlock = new GnomeWarlock(context, level, new Position(2, 0), 'saved-warlock');
  warlock.restoreSummonsRemaining(1);
  level.putNpc(warlock);
  level.putNpc(new BoundFamiliar(context, level, new Position(3, 0), 'saved-warlock'));
  const projector = new RimeProjector(context, level, new Position(1, 2));
  projector.restoreCycle(2);
  level.putNpc(projector);
  const turret = new EmberTurret(context, level, new Position(1, 3));
  turret.restoreCycle(1);
  level.putNpc(turret);
  level.putNpc(new WarmthFountain(context, level, new Position(2, 3)));
  level.putItem(new Position(4, 4), new ArmorPotion(context));
  level.putAtmosphere(new Position(0, 4), {
    kind: 'fog', turnsLeft: 9, density: 2, drift: 'left', driftIn: 3,
  }, false);

  return world as World;
}

describe('GameSaveCodec', () => {
  it('round-trips all gameplay state without changing it', () => {
    const codec: GameSaveCodec = new GameSaveCodec();
    const original = createWorld();
    const generatedUniqueBookIds = new Set([SurveyNotesLanternSiteSevenBook.saveId]);
    const saved = codec.serialize(
      original.player,
      original.levels,
      original.currentLevelIndex,
      generatedUniqueBookIds,
    );
    const restoredWorld: Partial<World> = {currentLevelIndex: 0};
    const restored = codec.restore(contextFor(restoredWorld), saved);
    Object.assign(restoredWorld, restored);
    const savedAgain = codec.serialize(
      restored.player,
      restored.levels,
      restored.currentLevelIndex,
      restored.generatedUniqueBookIds,
    );

    expect(savedAgain).toEqual(saved);
    expect(restored.generatedUniqueBookIds).toEqual(generatedUniqueBookIds);
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
      [BurningState.saveId, 4, {damagePerTurn: 2, damageType: 'fire'}],
      [PoisonedState.saveId, 6, {damagePerTurn: 1, damageType: 'poison'}],
    ]);

    const restoredLevel = restored.levels[1];
    expect(restored.currentLevelIndex).toBe(1);
    expect(restored.levels[0].levelNo).toBe(1);
    expect(restoredLevel.levelNo).toBe(2);
    expect(restoredLevel.map.getInitialPosition()).toEqual(new Position(1, 1));
    expect(restoredLevel.map.getTile(new Position(1, 1))?.isExplored()).toBe(true);
    expect(restoredLevel.map.getTile(new Position(1, 1))?.getIsBloody()).toBe(true);
    expect(restoredLevel.getItem(new Position(4, 4))?.saveId).toBe(ArmorPotion.saveId);
    expect(restoredLevel.map.getTile(new Position(4, 0))?.saveId).toBe(DeepEmberTile.saveId);
    const restoredChest = restoredLevel.map.getTile(new Position(4, 1)) as LootChestTile;
    expect(restoredChest).toBeInstanceOf(LootChestTile);
    expect(restoredChest.rarity).toBe('reinforced');
    expect(restoredChest.getItems().map(item => item.saveId)).toEqual([
      LongSword.saveId,
      ArmorPotion.saveId,
    ]);
    expect(restoredLevel.getAtmosphere(new Position(0, 4))).toEqual({
      kind: 'fog', turnsLeft: 9, density: 2, drift: 'left', driftIn: 3,
    });
    expect(restoredLevel.getNpcAt(new Position(1, 0))).toBeInstanceOf(KoboldSalvekeeper);
    expect(restoredLevel.getNpcAt(new Position(2, 0))).toBeInstanceOf(GnomeWarlock);
    expect(restoredLevel.getNpcAt(new Position(3, 0))).toBeInstanceOf(BoundFamiliar);
    expect(restoredLevel.getNpcAt(new Position(1, 2))).toBeInstanceOf(RimeProjector);
    expect(restoredLevel.getNpcAt(new Position(1, 3))).toBeInstanceOf(EmberTurret);
    expect(restoredLevel.getNpcAt(new Position(2, 3))).toBeInstanceOf(WarmthFountain);

    const restoredGoblin = restoredLevel.getNpcAt(new Position(2, 2))!;
    expect(restoredGoblin.hp).toBe(5);
    expect(restoredGoblin.mp).toBe(7);
    expect(restoredGoblin.strength).toBe(12);
    expect(restoredGoblin.endurance).toBe(5);
    expect(restoredGoblin.getPreviousAction()).toBe(Action.Flee);
    expect(restoredGoblin.getModifiers()[0].saveId).toBe(
      StrengthMonsterModifier.saveId,
    );
    expect(restoredGoblin.getModifiers()[1].saveId).toBe(
      EnduranceMonsterModifier.saveId,
    );
    expect(Array.from(restoredGoblin.states)[0].getTurnsLeft()).toBe(3);
    const restoredWolf = restoredLevel.getNpcAt(new Position(0, 0))!;
    expect(Array.from(restoredWolf.states)[0].saveId).toBe(BurningState.saveId);
    expect(Array.from(restoredWolf.states)[0].getTurnsLeft()).toBe(3);

    const restoredTreasureGoblin = restoredLevel.getNpcAt(
      new Position(3, 3),
    ) as TreasureGoblin;
    expect(restoredTreasureGoblin.getBaseLootCost()).toBe(37);
    expect(restoredTreasureGoblin.getTimer()).toBe(11);
    expect(restoredTreasureGoblin.hasTimerStarted()).toBe(true);
    expect(restoredLevel.getNpcAt(new Position(4, 0))).toBeInstanceOf(EmberGuardian);
    expect(restoredLevel.getNpcAt(new Position(0, 3))).toBeInstanceOf(FlameCinderling);
    expect(restoredLevel.getNpcAt(new Position(0, 4))).toBeInstanceOf(RimeCinderling);
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

  it('accepts saves written before unique book history was persisted', () => {
    const codec: GameSaveCodec = new GameSaveCodec();
    const world = createWorld();
    const legacy = JSON.parse(JSON.stringify(
      codec.serialize(world.player, world.levels, world.currentLevelIndex),
    ));
    delete legacy.generatedUniqueBookIds;

    codec.validate(legacy);

    expect(legacy.generatedUniqueBookIds).toEqual([]);
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

    const unknownStatueVariant = JSON.parse(JSON.stringify(saved));
    unknownStatueVariant.levels[0].map.tiles[0][0] = {
      kind: 'statue', explored: true, bloody: false,
      inscriptionId: 'forgotten-king', statueVariantId: 'unknown',
    };
    expect(() => codec.validate(unknownStatueVariant)).toThrow('Invalid tile');

    const unknownBumpDescription = JSON.parse(JSON.stringify(saved));
    unknownBumpDescription.levels[0].map.tiles[0][0] = {
      kind: 'water', explored: true, bloody: false, bumpDescriptionId: 'unknown',
    };
    expect(() => codec.validate(unknownBumpDescription)).toThrow('Invalid tile');

    const unknownStepDescription = JSON.parse(JSON.stringify(saved));
    unknownStepDescription.levels[0].map.tiles[0][0] = {
      kind: 'glowing-mushroom', explored: true, bloody: false, stepDescriptionId: 'unknown',
    };
    expect(() => codec.validate(unknownStepDescription)).toThrow('Invalid tile');

    const malformedStepMessagesShown = JSON.parse(JSON.stringify(saved));
    malformedStepMessagesShown.levels[0].map.tiles[0][0].stepMessagesShown = 'yes';
    expect(() => codec.validate(malformedStepMessagesShown)).toThrow('Invalid tile');

    const malformedChest = JSON.parse(JSON.stringify(saved));
    malformedChest.levels[0].map.tiles[0][0] = {
      kind: 'loot-chest', explored: true, bloody: false,
      lootChest: {rarity: 'mythic', items: []},
    };
    expect(() => codec.validate(malformedChest)).toThrow('Invalid tile');

    const malformedValve = JSON.parse(JSON.stringify(saved));
    malformedValve.levels[0].map.tiles[0][0] = {
      kind: 'pressure-valve', explored: true, bloody: false,
    };
    expect(() => codec.validate(malformedValve)).toThrow('Invalid tile');
  });

  it('rejects unknown NPC kinds', () => {
    const codec = new GameSaveCodec();
    const world = createWorld();
    const saved = codec.serialize(world.player, world.levels, world.currentLevelIndex);
    const unknownNpc = JSON.parse(JSON.stringify(saved));
    unknownNpc.levels[1].npcs[0].kind = 'unknown';

    expect(() => codec.validate(unknownNpc)).toThrow('Invalid NPC');
  });
});

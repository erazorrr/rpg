import {Position} from '../../io/position';
import {Context} from '../context';
import {GameMap} from '../game.map';
import {Level} from '../level';
import {Tile} from '../tiles/abstract.tile';
import {applyDungeonBiomes, assignDungeonBiomes} from './dungeon-biomes';
import {DungeonBiome, generateDungeonLayout} from './dungeon-layout';
import {
  ORDINARY_DUNGEON_NPC_TARGET,
  populateDungeon,
  rollMonsterPack,
  rollMonsterModifierCount,
} from './dungeon-population';
import {decorateDungeon} from './dungeon-structures';
import {MIN_DUNGEON_NAVIGABLE_TILES, countNavigableTiles} from './dungeon-validation';
import {PhaseSpider} from '../monsters/phase-spider';
import {RiftWisp} from '../monsters/rift-wisp';
import {Wolf} from '../monsters/wolf';
import {CaveLeech} from '../monsters/cave-leech';
import {BloodBat} from '../monsters/blood-bat';
import {VampiricMonsterModifier} from '../monster-modifiers/vampiric';
import {CaveAsp} from '../monsters/cave-asp';
import {Goblin} from '../monsters/goblin';
import {GoblinSkirmisher} from '../monsters/goblin-skirmisher';
import {SteamBeetle} from '../monsters/steam-beetle';
import {KoboldHookBearer} from '../monsters/kobold-hook-bearer';
import {KoboldSalvekeeper} from '../monsters/kobold-salvekeeper';
import {GnomeArcher} from '../monsters/gnome-archer';
import {GnomeWarlock} from '../monsters/gnome-warlock';
import {WarmthFountain} from '../monsters/warmth-fountain';
import {RimeProjector} from '../monsters/rime-projector';
import {EmberTurret} from '../monsters/ember-turret';

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

describe('dungeon population', () => {
  it('forms coherent swarms and mixed intelligent patrols', () => {
    expect(rollMonsterPack(SteamBeetle, 1, DungeonBiome.Cavern, () => 0)).toEqual([
      SteamBeetle, SteamBeetle, SteamBeetle,
    ]);

    const rolls = [0, 0, 0, .2, 0];
    const patrol = rollMonsterPack(Goblin, 1, DungeonBiome.Cavern, () => rolls.shift() ?? 0);
    expect(patrol[0]).toBe(Goblin);
    expect(patrol).toHaveLength(3);
    expect(patrol.some(member => member === GoblinSkirmisher || member === SteamBeetle)).toBe(true);
  });

  it('only allows rare fourth and fifth modifiers on the final floor', () => {
    expect(rollMonsterModifierCount(2, .999)).toBe(3);
    expect(rollMonsterModifierCount(3, .979)).toBe(3);
    expect(rollMonsterModifierCount(3, .98)).toBe(4);
    expect(rollMonsterModifierCount(3, .994)).toBe(4);
    expect(rollMonsterModifierCount(3, .995)).toBe(5);
  });

  it('keeps the large-floor density target without overlapping monsters', () => {
    const random = seeded(1);
    const draft = generateDungeonLayout(200, 200, new Position(199, 27), random);
    assignDungeonBiomes(draft, 2, random);
    applyDungeonBiomes(draft, random);
    decorateDungeon(draft, 2, random);
    expect(countNavigableTiles(draft)).toBeGreaterThanOrEqual(MIN_DUNGEON_NAVIGABLE_TILES);

    const world: {level?: Level} = {};
    const context: Context = {
      getPlayer: () => null!,
      getCurrentMap: () => world.level!.map,
      postGameMessage: () => {},
      getRenderer: () => null!,
      tick: () => {},
      getIsFree: () => true,
      getCharacter: () => undefined,
      getItem: () => undefined,
      buildPath: () => [],
      log: () => {},
      destroyNpc: () => {},
      getCurrentGameLevel: () => world.level!,
    };
    const map = new GameMap(context, draft.tiles as Tile[][], draft.upstairs, 200, 200, 80, 24);
    const level = new Level(2, map);
    world.level = level;
    populateDungeon(context, level, draft, 2, random);

    const npcs = level.getNpcs();
    expect(npcs).toHaveLength(ORDINARY_DUNGEON_NPC_TARGET + 4);
    expect(new Set(npcs.map(npc => npc.position.serialize())).size).toBe(npcs.length);
    expect(npcs.every(npc => map.isNavigable(npc.position))).toBe(true);
    expect(npcs.some(npc => npc instanceof PhaseSpider)).toBe(true);
    expect(npcs.some(npc => npc instanceof RiftWisp)).toBe(true);
    expect(npcs.some(npc => npc instanceof CaveLeech)).toBe(true);
    expect(npcs.some(npc => npc instanceof BloodBat)).toBe(true);
    expect(npcs.some(npc => npc instanceof CaveAsp)).toBe(true);
    expect(npcs.some(npc => npc instanceof KoboldHookBearer)).toBe(true);
    expect(npcs.some(npc => npc instanceof KoboldSalvekeeper)).toBe(true);
    expect(npcs.some(npc => npc instanceof GnomeArcher)).toBe(true);
    expect(npcs.some(npc => npc instanceof GnomeWarlock)).toBe(true);
    expect(npcs.some(npc => npc instanceof WarmthFountain)).toBe(true);
    expect(npcs.some(npc => npc instanceof RimeProjector)).toBe(true);
    expect(npcs.some(npc => npc instanceof EmberTurret)).toBe(true);
    expect(npcs.some(npc => npc instanceof Wolf)).toBe(false);
    expect(npcs.some(npc => npc.getModifiers().some(modifier => modifier instanceof VampiricMonsterModifier))).toBe(true);
    expect(npcs.filter(npc => !npc.getIsBloody()).every(
      npc => npc.getModifiers().every(modifier => !(modifier instanceof VampiricMonsterModifier)),
    )).toBe(true);
  });
});

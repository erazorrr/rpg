import { Context } from './context';
import { Position } from '../io/position';
import { Level } from './level';
import { GameMap } from './game.map';
import { Player } from './player';
import { Npc, Action } from './npc';
import {CharacterSave, SaveFileV1} from './save-data';
import {restoreItem} from './items/item.factory';
import {restoreMonsterModifier} from './monster-modifiers/monster-modifier.factory';
import {restoreNpc} from './monsters/npc.factory';
import {restoreState} from './state.factory';

function restoreCharacter(
  context: Context,
  c: Player | Npc,
  data: CharacterSave,
): void {
  c.position = new Position(data.position.x, data.position.y);
  c.strength = data.strength;
  c.dexterity = data.dexterity;
  c.endurance = data.endurance;
  c.wisdom = data.wisdom;
  c.equipment = {};
  for (const [slot, item] of Object.entries(data.equipment))
    if (item) c.equipment[slot] = restoreItem(context, item);
  c.states = new Set(data.states.map(restoreState));
  c.hp = data.hp;
  c.mp = data.mp;
}

/**
 * Transitional codec for the v1 save format. It is kept separate from the
 * save-slot service so filesystem concerns never need to import game content.
 */
export class GameSaveCodec {
  public serialize(
    player: Player,
    levels: Level[],
    currentLevelIndex: number,
  ): SaveFileV1 {
    const data: SaveFileV1 = {
      format: 'rpg-save',
      version: 1,
      currentLevelIndex,
      player: player.toSaveData(),
      levels: levels.map(level => level.toSaveData()),
    };
    this.validate(data);
    return data;
  }
  public restore(
    context: Context,
    data: SaveFileV1,
    width = 80,
    height = 24,
  ): { player: Player; levels: Level[]; currentLevelIndex: number } {
    const levels = data.levels.map(level => new Level(
      level.levelNo,
      GameMap.fromSaveData(context, level.map, width, height),
    ));
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i],
        dataLevel = data.levels[i];
      for (const ground of dataLevel.items)
        level.putItem(
          new Position(ground.position.x, ground.position.y),
          restoreItem(context, ground.item),
        );
      for (const n of dataLevel.npcs) {
        const npc = restoreNpc(context, level, n);
        restoreCharacter(context, npc, n);
        for (const modifierId of n.modifiers)
          npc.applyModifier(restoreMonsterModifier(modifierId));
        npc.restorePreviousAction(n.previousAction as Action);
        level.putNpc(npc);
      }
    }
    const player = Player.fromSaveData(context, data.player);
    return { player, levels, currentLevelIndex: data.currentLevelIndex };
  }
  public validate(value: unknown): asserts value is SaveFileV1 {
    const d = value as Partial<SaveFileV1>;
    if (
      d.player &&
      d.player.level === undefined &&
      Number.isInteger(d.player.xp) &&
      d.player.xp >= 0
    ) {
      d.player.level = Player.inferLevelFromXp(d.player.xp);
    }
    if (
      !d ||
      d.format !== 'rpg-save' ||
      d.version !== 1 ||
      !Array.isArray(d.levels) ||
      d.levels.length === 0 ||
      !Number.isInteger(d.currentLevelIndex) ||
      d.currentLevelIndex! < 0 ||
      d.currentLevelIndex! >= d.levels.length ||
      !d.player ||
      !Number.isInteger(d.player.level) ||
      d.player.level < 1 ||
      !Number.isInteger(d.player.xp) ||
      d.player.xp < 0
    )
      throw new Error('Unsupported or malformed save file');
    for (const level of d.levels) {
      if (
        !level.map ||
        !Number.isInteger(level.map.width) ||
        !Number.isInteger(level.map.height) ||
        level.map.width! <= 0 ||
        level.map.height! <= 0 ||
        !Array.isArray(level.map.tiles) ||
        level.map.tiles.length !== level.map.width ||
        level.map.tiles.some(
          (c) => !Array.isArray(c) || c.length !== level.map!.height,
        )
      )
        throw new Error('Invalid map in save file');
    }
  }
}

import { Context } from './context';
import { Position } from '../io/position';
import { Level } from './level';
import { GameMap } from './game.map';
import { Player } from './player';
import { Npc, Action } from './npc';
import {CharacterSave, SaveFileV2, TileSave} from './save-data';
import {restoreItem} from './items/item.factory';
import {restoreMonsterModifier} from './monster-modifiers/monster-modifier.factory';
import {knownNpcSaveIds, restoreNpc} from './monsters/npc.factory';
import {knownStateSaveIds, restoreState} from './state.factory';
import {knownTileSaveIds} from './tiles/tile.factory';
import {isStatueInscriptionId} from './tiles/statue-inscriptions';
import {isStatueVariantId} from './tiles/statue-variants';
import {UNIQUE_BOOK_SAVE_IDS} from './items/books/books';
import {knownItemSaveIds} from './items/item.factory';
import {isLootChestRarity} from './tiles/loot-chest.tile';
import {knownSpellSaveIds} from './spells/spell.factory';
import {BarricadeTile} from './tiles/barricade.tile';
import {DeadBrazierTile} from './tiles/dead-brazier.tile';
import {PipeWallTile} from './tiles/pipe-wall.tile';
import {RubbleTile} from './tiles/rubble.tile';
import {SmokingBrazierTile} from './tiles/smoking-brazier.tile';
import {StonePillarTile} from './tiles/stone-pillar.tile';
import {WaterTile} from './tiles/water.tile';
import {GlowingMushroomTile} from './tiles/glowing-mushroom.tile';
import {CrystalSeamTile} from './tiles/crystal-seam.tile';
import {MosaicFloorTile} from './tiles/mosaic-floor.tile';
import {HeatGrateTile} from './tiles/heat-grate.tile';
import {SteamFissureTile} from './tiles/steam-fissure.tile';
import {MistSeepTile} from './tiles/mist-seep.tile';
import {VeyranWaystoneTile} from './tiles/veyran-waystone.tile';

function hasInvalidBumpDescription(tile: TileSave): boolean {
  if (tile.bumpDescriptionId === undefined) return false;
  if (tile.kind === BarricadeTile.saveId) return !BarricadeTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === RubbleTile.saveId) return !RubbleTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === StonePillarTile.saveId) return !StonePillarTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === DeadBrazierTile.saveId) return !DeadBrazierTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === SmokingBrazierTile.saveId) return !SmokingBrazierTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === PipeWallTile.saveId) return !PipeWallTile.isDescriptionId(tile.bumpDescriptionId);
  if (tile.kind === WaterTile.saveId) return !WaterTile.isDescriptionId(tile.bumpDescriptionId);
  return true;
}

function hasInvalidStepDescription(tile: TileSave): boolean {
  if (tile.stepDescriptionId === undefined) return false;
  if (tile.kind === GlowingMushroomTile.saveId) return !GlowingMushroomTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === CrystalSeamTile.saveId) return !CrystalSeamTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === MosaicFloorTile.saveId) return !MosaicFloorTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === HeatGrateTile.saveId) return !HeatGrateTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === SteamFissureTile.saveId) return !SteamFissureTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === MistSeepTile.saveId) return !MistSeepTile.isDescriptionId(tile.stepDescriptionId);
  if (tile.kind === VeyranWaystoneTile.saveId) return !VeyranWaystoneTile.isDescriptionId(tile.stepDescriptionId);
  return true;
}

function hasInvalidStates(character: Partial<CharacterSave>): boolean {
  return !Array.isArray(character.states) || character.states.some(state => (
    !state || typeof state !== 'object' ||
    typeof state.kind !== 'string' || !knownStateSaveIds.has(state.kind) ||
    !Number.isInteger(state.turns) || state.turns <= 0 ||
    !state.stats || typeof state.stats !== 'object'
  ));
}

function hasInvalidNpcSpecificData(npc: import('./save-data').NpcSave): boolean {
  if (npc.kind === 'kobold-salvekeeper') {
    return !npc.healer || !Number.isInteger(npc.healer.charges) || npc.healer.charges < 0 || npc.healer.charges > 3;
  }
  if (npc.kind === 'gnome-warlock') {
    return !npc.warlock || typeof npc.warlock.id !== 'string' || npc.warlock.id.length === 0 ||
      !Number.isInteger(npc.warlock.summonsRemaining) ||
      npc.warlock.summonsRemaining < 0 || npc.warlock.summonsRemaining > 2;
  }
  if (npc.kind === 'bound-familiar') {
    return !npc.familiar || typeof npc.familiar.ownerId !== 'string' || npc.familiar.ownerId.length === 0;
  }
  if (npc.kind === 'rime-projector') {
    return !npc.mechanism || !Number.isInteger(npc.mechanism.cycle) ||
      npc.mechanism.cycle < 0 || npc.mechanism.cycle >= 4;
  }
  if (npc.kind === 'ember-turret') {
    return !npc.mechanism || !Number.isInteger(npc.mechanism.cycle) ||
      npc.mechanism.cycle < 0 || npc.mechanism.cycle >= 3;
  }
  return false;
}

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
    generatedUniqueBookIds: ReadonlySet<string> = new Set(),
  ): SaveFileV2 {
    const data: SaveFileV2 = {
      format: 'rpg-save',
      version: 2,
      currentLevelIndex,
      generatedUniqueBookIds: Array.from(generatedUniqueBookIds),
      player: player.toSaveData(),
      levels: levels.map(level => level.toSaveData()),
    };
    this.validate(data);
    return data;
  }
  public restore(
    context: Context,
    data: SaveFileV2,
    width = 80,
    height = 24,
  ): {
    player: Player;
    levels: Level[];
    currentLevelIndex: number;
    generatedUniqueBookIds: Set<string>;
  } {
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
      for (const atmosphere of dataLevel.atmosphere ?? []) {
        level.putAtmosphere(
          new Position(atmosphere.position.x, atmosphere.position.y),
          {
            kind: atmosphere.kind,
            turnsLeft: atmosphere.turnsLeft,
            density: atmosphere.density,
            drift: atmosphere.drift,
            driftIn: atmosphere.driftIn,
          },
          atmosphere.fresh ?? false,
        );
      }
      level.restoreAtmosphereTurn(dataLevel.atmosphereTurn);
      for (const n of dataLevel.npcs) {
        const npc = restoreNpc(context, level, n);
        restoreCharacter(context, npc, n);
        for (const modifierId of n.modifiers)
          npc.applyModifier(restoreMonsterModifier(modifierId));
        npc.restorePreviousAction(n.previousAction as Action);
        npc.restoreLastSeenPlayerPosition(n.lastSeenPlayerPosition);
        level.putNpc(npc);
      }
    }
    const player = Player.fromSaveData(context, data.player);
    return {
      player,
      levels,
      currentLevelIndex: data.currentLevelIndex,
      generatedUniqueBookIds: new Set(data.generatedUniqueBookIds),
    };
  }
  public validate(value: unknown): asserts value is SaveFileV2 {
    const d = value as Partial<SaveFileV2>;
    if (d && d.generatedUniqueBookIds === undefined) d.generatedUniqueBookIds = [];
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
      d.version !== 2 ||
      !Array.isArray(d.levels) ||
      d.levels.length === 0 ||
      !Number.isInteger(d.currentLevelIndex) ||
      d.currentLevelIndex! < 0 ||
      d.currentLevelIndex! >= d.levels.length ||
      !Array.isArray(d.generatedUniqueBookIds) ||
      d.generatedUniqueBookIds.some(id => typeof id !== 'string' || !UNIQUE_BOOK_SAVE_IDS.has(id)) ||
      new Set(d.generatedUniqueBookIds).size !== d.generatedUniqueBookIds.length ||
      !d.player ||
      !Number.isInteger(d.player.level) ||
      d.player.level < 1 ||
      !Number.isInteger(d.player.xp) ||
      hasInvalidStates(d.player) ||
      !Array.isArray(d.player.knownSpells) ||
      d.player.knownSpells.some(id => typeof id !== 'string' || !knownSpellSaveIds.has(id)) ||
      d.player.xp < 0
    )
      throw new Error('Unsupported or malformed save file');
    for (const level of d.levels) {
      if (
        !Number.isInteger(level.atmosphereTurn) || level.atmosphereTurn < 0 ||
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
      for (const column of level.map.tiles) {
        for (const tile of column) {
          if (
            !tile || typeof tile !== 'object' ||
            typeof tile.kind !== 'string' || !knownTileSaveIds.has(tile.kind) ||
            typeof tile.explored !== 'boolean' || typeof tile.bloody !== 'boolean' ||
            (tile.stepMessagesShown !== undefined && typeof tile.stepMessagesShown !== 'boolean') ||
            hasInvalidBumpDescription(tile) ||
            hasInvalidStepDescription(tile) ||
            (tile.kind === 'statue' && (
              !isStatueInscriptionId(tile.inscriptionId) ||
              (tile.statueVariantId !== undefined && !isStatueVariantId(tile.statueVariantId))
            )) ||
            (tile.kind === 'loot-chest' && (
              !tile.lootChest ||
              !isLootChestRarity(tile.lootChest.rarity) ||
              !Array.isArray(tile.lootChest.items) ||
              tile.lootChest.items.some(item =>
                !item || typeof item.kind !== 'string' || !knownItemSaveIds.has(item.kind) ||
                !Array.isArray(item.modifiers) || item.modifiers.some(modifier => typeof modifier !== 'string')
              )
            )) ||
            (tile.kind === 'pressure-valve' && typeof tile.pressureValveSpent !== 'boolean')
          ) throw new Error('Invalid tile in save file');
        }
      }
      if (!Array.isArray(level.npcs) || level.npcs.some(npc => (
        !npc || typeof npc !== 'object' ||
        typeof npc.kind !== 'string' || !knownNpcSaveIds.has(npc.kind) ||
        hasInvalidStates(npc) || hasInvalidNpcSpecificData(npc)
      ))) throw new Error('Invalid NPC in save file');
      if (!Array.isArray(level.atmosphere) || level.atmosphere.some(cell => (
        !cell || typeof cell !== 'object' ||
        !['smoke', 'steam', 'fog'].includes(cell.kind) ||
        !Number.isInteger(cell.position?.x) || !Number.isInteger(cell.position?.y) ||
        cell.position.x < 0 || cell.position.x >= level.map!.width! ||
        cell.position.y < 0 || cell.position.y >= level.map!.height! ||
        !Number.isInteger(cell.turnsLeft) || cell.turnsLeft <= 0 ||
        ![1, 2, 3].includes(cell.density) ||
        !['up', 'down', 'left', 'right'].includes(cell.drift) ||
        !Number.isInteger(cell.driftIn) || cell.driftIn <= 0 ||
        (cell.fresh !== undefined && typeof cell.fresh !== 'boolean')
      ))) throw new Error('Invalid atmosphere in save file');
    }
  }
}

import {GameState} from "./game.state";
import {Renderer} from "../io/renderer";
import {Field} from "../io/field";
import * as process from "node:process";
import {Player} from "./player";
import {Position} from "../io/position";
import {MainMenu} from "./main-menu";
import {GameMessage, GameMessageType} from "./game-message";
import {Action, Npc} from "./npc";
import {GameLog} from "./game-log";
import {HealthBar} from "./health-bar";
import {LevelBar} from "./level-bar";
import {XpBar} from "./xp-bar";
import {Item} from "./item";
import {Context} from "./context";
import {Inventory} from "./inventory";
import {InputEmitter, setInputSuspended} from "../io/input.emitter";
import {InputEvent} from "../io/input.event";
import {Weapon} from "./items/weapons/weapon";
import {Chest} from "./items/chest/chest";
import {Potion} from "./items/potions/potion";
import {Boots} from "./items/boots/boots";
import {Gauntlets} from "./items/gauntlets/gauntlets";
import {PlayerStats} from "./player-stats";
import {Level} from "./level";
import {LevelGenerator} from "./level-generator";
import {LootGenerator} from "./loot-generator";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {StairsUpTile} from "./tiles/stairs-up.tile";
import {LevelUpPopup} from "./level-up-popup";
import {State} from "./state";
import {MagicBar} from "./magic-bar";
import {SpellBook} from "./spell-book";
import {Spell, SpellTarget} from "./spell";
import {SelectTarget} from "./select-target";
import {Scroll} from "./abstract.scroll";
import {Bracelet} from "./items/gauntlets/bracelet";
import {GameSaveCodec} from "./game-save-codec";
import {SaveGameService} from "./save-game";
import {List} from "../io/list";
import {performance} from "node:perf_hooks";
import {AnimationFrame, ProjectileEffect, ProjectilePresentation} from "./animation";
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {EmberGuardian} from './monsters/ember-guardian';
import {getAtmosphereChar} from './atmosphere';
import {Book} from "./items/books/book";
import {BookPopup} from "./book-popup";
import {Debug} from "../debug";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from '../io/background.color';
import {StatueTile} from './tiles/statue.tile';
import {StatueInscriptionId} from './tiles/statue-inscriptions';
import {VeyranSurveyMap} from './items/veyran-survey-map';
import {TreasureGoblin} from './monsters/treasure-goblin';
import {LootChestTile} from './tiles/loot-chest.tile';
import {CrystalClusterTile} from './tiles/crystal-cluster.tile';
import {CaveFloorTile} from './tiles/cave-floor.tile';
import {PressureValveTile} from './tiles/pressure-valve.tile';
import {FrostGeodeTile} from './tiles/frost-geode.tile';
import {AshUrnTile} from './tiles/ash-urn.tile';
import {FlagstoneFloorTile} from './tiles/flagstone-floor.tile';
import {FrozenState} from './states/frozen.state';
import {
  calculateScreenLayout,
  MIN_TERMINAL_COLUMNS,
  MIN_TERMINAL_ROWS,
  ScreenLayout,
} from './screen-layout';

export class Game {
  private static readonly PAUSE_MENU_WIDTH = 50;
  private static readonly PAUSE_MENU_HEIGHT = 15;

  private state = GameState.Menu;
  private renderer = new Renderer();
  private inputEmitter = new InputEmitter();
  private screenLayout: ScreenLayout = calculateScreenLayout(process.stdout.columns, process.stdout.rows);

  private player: Player | null = null;

  private inventory: Inventory | null = null;
  private spellBook: SpellBook | null = null;
  private selectTarget: SelectTarget | null = null;
  private levelUpWindow: LevelUpPopup | null = null;
  private pauseMenu: List | null = null;
  private bookPopup: BookPopup | null = null;
  private saveFile = new SaveGameService();
  private saveCodec = new GameSaveCodec();

  private selectedSpell: Spell | null = null;

  private animationStartedAtMs = performance.now();
  private animationTimer: NodeJS.Timeout | null = null;
  private effectTimer: NodeJS.Timeout | null = null;
  private renderScheduled = false;
  private isRendering = false;
  private isPresentingAction = false;
  private pendingProjectiles: ProjectilePresentation[] = [];
  private activeProjectiles: ProjectileEffect[] = [];
  private projectileBatchComplete: (() => void) | null = null;

  private gameLog: GameLog = new GameLog(30);
  private telemetry = new Debug('telemetry.jsonl');
  private turnNumber = 0;

  private levels: Level[] = [];
  private currentLevelIndex: number = 0;
  private getCurrentLevel(): Level {
    return this.levels[this.currentLevelIndex];
  }

  private getUsedStatueInscriptions(): Set<StatueInscriptionId> {
    const used = new Set<StatueInscriptionId>();
    for (const level of this.levels) {
      for (let x = 0; x < level.map.width; x++) {
        for (let y = 0; y < level.map.height; y++) {
          const tile = level.map.getTile(new Position(x, y));
          if (tile instanceof StatueTile) used.add(tile.inscriptionId);
        }
      }
    }
    return used;
  }

  private gameField = new Field(
    'Emberdeep',
    this.screenLayout.game.topLeft,
    this.screenLayout.game.bottomRight,
  );
  private menuField =  new Field(
    'Menu',
    this.screenLayout.menu.topLeft,
    this.screenLayout.menu.bottomRight,
  );
  private logField =  new Field(
    'Log',
    this.screenLayout.log.topLeft,
    this.screenLayout.log.bottomRight,
  );

  private playerStats = new PlayerStats(this.generateMenuFieldContext());

  private generateMenuFieldContext(): Context {
    return {
      getCurrentMap: () => this.getCurrentLevel().map,
      getPlayer: () => this.player,
      getRenderer: () => this.menuField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
      recordEvent: this.recordTelemetry.bind(this),
      getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
      destroyNpc: this.destroyNpc.bind(this),
      getCurrentGameLevel: () => this.getCurrentLevel(),
      presentProjectile: this.queueProjectile.bind(this),
    };
  }
  private healthBar = new HealthBar(this.generateMenuFieldContext());
  private magicBar = new MagicBar(this.generateMenuFieldContext());
  private levelBar = new LevelBar(this.generateMenuFieldContext());
  private xpBar = new XpBar(this.generateMenuFieldContext());

  private mainMenu = new MainMenu({
    getCurrentMap: () => this.getCurrentLevel().map,
    getPlayer: () => this.player,
    getRenderer: () => this.renderer,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
    recordEvent: this.recordTelemetry.bind(this),
    getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
    destroyNpc: this.destroyNpc.bind(this),
    getCurrentGameLevel: () => this.getCurrentLevel(),
  }, this.screenLayout.fullScreen.topLeft, this.screenLayout.fullScreen.bottomRight);

  constructor() {
    setInputSuspended(!this.screenLayout.isSupported);
    process.stdout.on('resize', () => this.resize());
  }

  private resize(): void {
    this.screenLayout = calculateScreenLayout(process.stdout.columns, process.stdout.rows);
    setInputSuspended(!this.screenLayout.isSupported);
    this.renderer.clear();
    if (!this.screenLayout.isSupported) {
      this.render(false, false);
      return;
    }

    this.gameField.setBounds(this.screenLayout.game.topLeft, this.screenLayout.game.bottomRight);
    this.menuField.setBounds(this.screenLayout.menu.topLeft, this.screenLayout.menu.bottomRight);
    this.logField.setBounds(this.screenLayout.log.topLeft, this.screenLayout.log.bottomRight);
    this.mainMenu.setLTPosition(this.screenLayout.fullScreen.topLeft);
    this.mainMenu.setRBPosition(this.screenLayout.fullScreen.bottomRight);
    this.centerPauseMenu();

    this.levelGenerator.setContainerSize(this.gameField.getWidth(), this.gameField.getHeight());
    for (const level of this.levels) {
      level.map.setContainerSize(this.gameField.getWidth(), this.gameField.getHeight());
    }

    this.resizeActiveOverlays();
    this.render(false, false);
  }

  private destroyNpc(npc: Npc) {
    this.getCurrentLevel()?.removeNpc(npc);
  }

  private getCharacterAt(position: Position) {
    if (this.player && position.equals(this.player.position)) {
      return this.player;
    }
    return this.getCurrentLevel()?.getNpcAt(position) ?? null;
  }

  private isFree(position: Position): boolean {
    return this.getCharacterAt(position) === null;
  }

  private gameFinished = false;
  private isGameFinished() {
    return this.gameFinished;
  }

  private generatedUniqueBookIds = new Set<string>();
  private lootGenerator = new LootGenerator(this.generateGameObjectContext());
  private receiveGameMessage(message: GameMessage): void {
    switch (message.type) {
      case GameMessageType.StartLevelUp:
        this.levelUpWindow = new LevelUpPopup(this.generateGameObjectContext());
        this.resizeActiveOverlays();
        this.levelUpWindow.makeInteractive();
        this.player?.makeUninteractive();
        this.render();
        break;
      case GameMessageType.FinishLevelUp:
        this.levelUpWindow?.makeUninteractive();
        this.levelUpWindow = null;
        this.player.hp = this.player.getMaxHp();
        this.player.mp = this.player.getMaxMp();
        this.player.makeInteractive();
        this.render();
        break;
      case GameMessageType.NewGame:
        if (this.saveFile.exists()) {
          try { this.saveFile.delete(); } catch (e) { this.gameLog.log(`Could not replace save: ${e instanceof Error ? e.message : e}`); return; }
        }
        this.newGame();
        break;
      case GameMessageType.Continue:
        this.loadGame();
        break;
      case GameMessageType.Save:
        this.saveCurrentGame(false);
        break;
      case GameMessageType.ExitAndSave:
        this.saveCurrentGame(true);
        break;
      case GameMessageType.DeleteInvalidSave:
        try {
          this.saveFile.delete();
          this.goToMainMenu();
        } catch (e) {
          this.gameLog.log(`Could not delete invalid save: ${e instanceof Error ? e.message : e}`);
          this.render();
        }
        break;
      case GameMessageType.Exit:
        this.exit();
        break;
      case GameMessageType.Kill: {
        const target = (message.payload as {character: Npc}).character;
        const xpReward = target.getXpReward();
        this.recordTelemetry('kill', {
          target: target.getName(),
          position: target.position,
          xp: xpReward,
        });
        const deathAtmosphere = target.getDeathAtmosphere();
        if (deathAtmosphere) this.getCurrentLevel().emitAtmosphere(target.position, deathAtmosphere);
        this.player.addXp(xpReward);
        this.gameLog.log(`Earned ${xpReward} XP!`);
        this.getCurrentLevel()?.removeNpc(target);
        const lootRolls = target instanceof TreasureGoblin
          ? [
            () => this.lootGenerator.generateTreasurePrize(
              target.getLootCost(),
              this.generatedUniqueBookIds,
              this.currentLevelIndex,
            ),
            () => this.lootGenerator.generateLoot(
              target.getLootCost(),
              this.generatedUniqueBookIds,
              this.currentLevelIndex,
            ),
          ]
          : [() => this.lootGenerator.generateLoot(
            target.getLootCost(),
            this.generatedUniqueBookIds,
            this.currentLevelIndex,
          )];
        if (target instanceof TreasureGoblin) {
          this.gameLog.log(`${target.getName()} spills its hoard!`);
        }
        for (const rollLoot of lootRolls) {
          const item = rollLoot();
          if (!item) continue;
          if (this.dropLoot(item, target.position)) {
            if (item instanceof Book && item.isUnique) {
              this.generatedUniqueBookIds.add(item.saveId);
            }
            this.gameLog.log(`${target.getName()} dropped ${item.getName()}!`);
          }
        }
        break;
      }
      case GameMessageType.Die:
        this.recordTelemetry('game_over', {
          outcome: 'death',
          snapshot: this.buildTelemetrySnapshot(),
        });
        this.bookPopup?.makeUninteractive();
        this.bookPopup = null;
        if (this.inventory) {
          this.inventory.makeUninteractive();
          this.inventory = null;
        }
        if (this.levelUpWindow) {
          this.levelUpWindow.makeUninteractive();
          this.levelUpWindow = null;
        }
        if (this.spellBook) {
          this.spellBook.makeUninteractive();
          this.spellBook = null;
        }
        if (this.selectTarget) {
          this.selectTarget.makeUninteractive();
          this.selectTarget = null;
        }
        this.player?.makeUninteractive();
        this.gameFinished = true;
        try { this.saveFile.delete(); } catch (e) { this.gameLog.log(`Could not delete save: ${e instanceof Error ? e.message : e}`); }
        this.render();
        this.stopPresentationClock();
        this.cancelProjectiles();
        break;
      case GameMessageType.PickUp: {
        const item = this.getCurrentLevel()?.getItem(this.player.position);
        if (item) {
          if (this.player.inventory.length >= 14) {
            this.gameLog.log(`${this.player.getName()} can't carry any more items!`);
            this.render();
            return;
          }
          this.player.inventory.push(item);
          this.getCurrentLevel()?.removeItem(this.player.position);
          this.recordTelemetry('inventory_change', {
            action: 'pick_up',
            item: item.getName(),
            stats: item.stats,
            position: this.player.position,
          });
          this.gameLog.log(`Picked up ${item.getName()}. [i] to open inventory.`);
          this.render();
        }
        break;
      }
      case GameMessageType.OpenLootChest: {
        const {chest, position} = message.payload as {chest: LootChestTile; position: Position};
        if (chest.getItems().length === 0) {
          this.gameLog.log(`The ${chest.getName().toLowerCase()} is empty.`);
          this.render();
          break;
        }
        this.gameLog.log(`${this.player.getName()} opens the ${chest.getName().toLowerCase()}. Loot spills out!`);
        this.recordTelemetry('open_loot_chest', {chest: chest.getName(), position});
        while (chest.getItems().length > 0) {
          const item = chest.getItems()[0];
          if (!this.dropLoot(item, position)) {
            this.gameLog.log(`There is no room for the rest of the chest's loot.`);
            break;
          }
          chest.takeItem(0);
          this.gameLog.log(`${chest.getName()} dropped ${item.getName()}!`);
        }
        this.render();
        break;
      }
      case GameMessageType.ShatterCrystal: {
        const {position} = message.payload as {position: Position};
        const cluster = this.getCurrentLevel().map.getTile(position);
        if (!(cluster instanceof CrystalClusterTile)) break;
        const floor = new CaveFloorTile();
        floor.setExplored(cluster.isExplored());
        floor.setBloody(cluster.getIsBloody());
        this.getCurrentLevel().map.setTile(position, floor);
        this.gameLog.log(`${this.player.getName()} shatters the brittle crystal cluster.`);
        this.recordTelemetry('terrain_interaction', {kind: 'crystal-cluster', position});
        this.tick();
        break;
      }
      case GameMessageType.ActivatePressureValve: {
        const {position} = message.payload as {position: Position};
        const valve = this.getCurrentLevel().map.getTile(position);
        if (!(valve instanceof PressureValveTile)) break;
        if (valve.isSpent()) {
          this.gameLog.log(`The pressure valve has already vented.`);
          this.render();
          break;
        }
        valve.activate();
        this.getCurrentLevel().emitAtmosphere(position, {
          kind: 'steam', turns: 4, density: 2, shape: 'cross',
        });
        this.gameLog.log(`${this.player.getName()} opens the valve. Steam bursts across the room!`);
        this.recordTelemetry('terrain_interaction', {kind: 'pressure-valve', position});
        this.tick();
        break;
      }
      case GameMessageType.ShatterFrostGeode: {
        const {position} = message.payload as {position: Position};
        const geode = this.getCurrentLevel().map.getTile(position);
        if (!(geode instanceof FrostGeodeTile)) break;
        const floor = new CaveFloorTile();
        floor.setExplored(geode.isExplored());
        floor.setBloody(geode.getIsBloody());
        this.getCurrentLevel().map.setTile(position, floor);
        const affected = [position, position.up(), position.right(), position.down(), position.left()];
        for (const targetPosition of affected) {
          const character = this.getCharacterAt(targetPosition);
          if (!character) continue;
          const frozen = new FrozenState(2);
          if (
            character.applyState(frozen) &&
            (character === this.player || this.player.canSeeCharacter(character))
          ) this.gameLog.log(frozen.getActiveMessage(character));
        }
        this.gameLog.log(`${this.player.getName()} shatters the frost geode. Rime bursts outward!`);
        this.recordTelemetry('terrain_interaction', {kind: 'frost-geode', position});
        this.tick();
        break;
      }
      case GameMessageType.ShatterAshUrn: {
        const {position} = message.payload as {position: Position};
        const urn = this.getCurrentLevel().map.getTile(position);
        if (!(urn instanceof AshUrnTile)) break;
        const floor = new FlagstoneFloorTile();
        floor.setExplored(urn.isExplored());
        floor.setBloody(urn.getIsBloody());
        this.getCurrentLevel().map.setTile(position, floor);
        this.getCurrentLevel().emitAtmosphere(position, {
          kind: 'smoke', turns: 7, density: 3, shape: 'cross',
        });
        this.gameLog.log(`${this.player.getName()} shatters the ash urn. Choking smoke billows out!`);
        this.recordTelemetry('terrain_interaction', {kind: 'ash-urn', position});
        this.tick();
        break;
      }
      case GameMessageType.SelectSpell: {
        const spell = (message.payload as {spell: Spell}).spell;
        if (spell.getMPCost() > this.player.mp) {
          this.gameLog.log(`Not enough MP!`);
          this.render();
          return;
        }
        switch (spell.target) {
          case SpellTarget.Self:
            this.recordTelemetry('player_action', {
              action: 'cast_self_spell',
              spell: spell.getName(),
              mpCost: spell.getMPCost(),
              position: this.player.position,
            });
            this.player.applySpell(this.player, spell);
            this.player.makeInteractive();
            this.player.spendMP(spell.getMPCost());
            this.tick();
            break;
          case SpellTarget.Monster: {
            this.selectedSpell = spell;
            this.selectTarget = new SelectTarget(this.generateGameObjectContext(), spell.stats.range);
            this.resizeActiveOverlays();
            this.selectTarget.makeInteractive();
            break;
          }
        }
        this.spellBook?.makeUninteractive();
        this.spellBook = null;
        this.render();
        break;
      }
      case GameMessageType.SelectTarget: {
        if (this.isPresentingAction) break;
        if (!this.selectedSpell) {
          if (!this.player.equipment.weapon?.isRanged) {
            break;
          }

          const npc = (message.payload as { npc: Npc }).npc;
          if (!this.player.canSeeCharacter(npc)) {
            this.gameLog.log(`${this.player.getName()} cannot see ${npc.getName()}!`);
            this.selectTarget?.makeUninteractive();
            this.selectTarget = null;
            this.player.makeInteractive();
            this.render();
            break;
          }
          this.recordTelemetry('player_action', {
            action: 'ranged_attack',
            target: npc.getName(),
            targetPosition: npc.position,
            weapon: this.player.equipment.weapon.getName(),
          });
          this.selectTarget?.makeUninteractive();
          this.selectTarget = null;
          this.render();
          this.isPresentingAction = true;
          this.player.makeUninteractive();
          this.player.attack(npc);
          this.presentPendingProjectiles(() => this.tick(true));
          break;
        }
        const npc = (message.payload as { npc: Npc }).npc;
        if (!this.player.canSeeCharacter(npc)) {
          this.gameLog.log(`${this.player.getName()} cannot see ${npc.getName()}!`);
          this.selectTarget?.makeUninteractive();
          this.selectTarget = null;
          this.selectedSpell = null;
          this.player.makeInteractive();
          this.render();
          break;
        }
        if (
          this.selectedSpell.stats.range !== undefined &&
          this.player.position.manhattanDistanceTo(npc.position) > this.selectedSpell.stats.range
        ) {
          this.gameLog.log(`${this.selectedSpell.getName()} cannot reach ${npc.getName()}!`);
          this.render();
          break;
        }
        this.recordTelemetry('player_action', {
          action: 'cast_targeted_spell',
          target: npc.getName(),
          targetPosition: npc.position,
          spell: this.selectedSpell.getName(),
          mpCost: this.selectedSpell.getMPCost(),
        });
        this.selectTarget?.makeUninteractive();
        this.selectTarget = null;
        this.render();
        this.isPresentingAction = true;
        this.player.makeUninteractive();
        npc.applySpell(this.player, this.selectedSpell);
        this.player.spendMP(this.selectedSpell.getMPCost());
        this.selectedSpell = null;
        this.presentPendingProjectiles(() => this.tick(true));
        break;
      }
    }
  }

  private dropItem(item: Item): void {
    this.recordTelemetry('inventory_change', {
      action: 'drop',
      item: item.getName(),
      stats: item.stats,
      position: this.player.position,
    });
    this.player.inventory = this.player.inventory.filter(i => i !== item);
    this.dropLoot(item, this.player.position);
    for (const [key, value] of Object.entries(this.player.equipment)) {
      if (value === item) {
        this.player.equipment[key] = undefined;
      }
    }
    if (this.player.hp > this.player.getMaxHp()) {
      this.player.hp = this.player.getMaxHp();
    }
    if (this.player.mp > this.player.getMaxMp()) {
      this.player.mp = this.player.getMaxMp();
    }
    this.gameLog.log(`Dropped ${item.getName()}.`);
  }

  private findPositionForLoot(position: Position): Position | null {
    let targetPosition = position;
    if (this.getCurrentLevel()?.getItem(targetPosition) || !this.getCurrentLevel()?.map.isNavigable(targetPosition)) {
      // tile has an item already or cannot hold one
      targetPosition = null;
      outer: for (let range = 1; range < 10; range++) {
        for (let i = position.x - range; i <= position.x + range; i++) {
          for (let j = position.y - range; j <= position.y + range; j++) {
            const position = new Position(i, j);
            if (!this.getCurrentLevel()?.getItem(position) && this.getCurrentLevel().map.isNavigable(position)) {
              targetPosition = position;
              break outer;
            }
          }
        }
      }
    }
    return targetPosition;
  }

  private dropLoot(item: Item, position: Position): boolean {
    const targetPosition = this.findPositionForLoot(position);
    if (targetPosition) {
      this.getCurrentLevel()?.putItem(targetPosition, item.clone());
      return true;
    }
    return false;
  }

  private queueProjectile(projectile: ProjectilePresentation): void {
    if (!this.gameFinished && projectile.path.length > 0) {
      this.pendingProjectiles.push({
        ...projectile,
        path: projectile.path.map(position => new Position(position.x, position.y)),
      });
    }
  }

  private presentPendingProjectiles(onComplete: () => void): void {
    if (this.pendingProjectiles.length === 0) {
      onComplete();
      return;
    }

    const startedAtMs = performance.now();
    this.activeProjectiles = this.pendingProjectiles.map(projectile => ({
      ...projectile,
      startedAtMs,
      travelMs: Math.min(450, Math.max(80, projectile.path.length * 30)),
      impactMs: 100,
    }));
    this.pendingProjectiles = [];
    this.projectileBatchComplete = onComplete;
    this.suspendPresentationInputs();
    this.scheduleEffectFrame();
    this.render(true, false);
  }

  private suspendPresentationInputs(): void {
    this.player?.makeUninteractive();
    this.inventory?.makeUninteractive();
    this.spellBook?.makeUninteractive();
    this.selectTarget?.makeUninteractive();
    this.levelUpWindow?.makeUninteractive();
    this.pauseMenu?.makeUninteractive();
    this.bookPopup?.makeUninteractive();
  }

  private scheduleEffectFrame(): void {
    if (this.effectTimer || this.activeProjectiles.length === 0) return;
    this.effectTimer = setTimeout(() => {
      this.effectTimer = null;
      const now = performance.now();
      const isComplete = this.activeProjectiles.every(effect =>
        now >= effect.startedAtMs + effect.travelMs + effect.impactMs
      );
      if (isComplete) {
        this.activeProjectiles = [];
        const onComplete = this.projectileBatchComplete;
        this.projectileBatchComplete = null;
        try {
          this.render(true, false);
        } finally {
          onComplete?.();
        }
      } else {
        this.requestRender();
        this.scheduleEffectFrame();
      }
    }, 30);
    this.effectTimer.unref?.();
  }

  private finishActionPresentation(): void {
    this.isPresentingAction = false;
    if (this.state === GameState.Game && !this.gameFinished) {
      if (this.bookPopup) this.bookPopup.makeInteractive();
      else if (this.inventory) this.inventory.makeInteractive();
      else if (this.spellBook) this.spellBook.makeInteractive();
      else if (this.selectTarget) this.selectTarget.makeInteractive();
      else if (this.levelUpWindow) this.levelUpWindow.makeInteractive();
      else if (this.pauseMenu) this.pauseMenu.makeInteractive(this.renderer);
      else this.player?.makeInteractive();
    }
    this.render();
  }

  private cancelProjectiles(): void {
    if (this.effectTimer) clearTimeout(this.effectTimer);
    this.effectTimer = null;
    this.pendingProjectiles = [];
    this.activeProjectiles = [];
    this.projectileBatchComplete = null;
    this.isPresentingAction = false;
  }

  private startPresentationClock(): void {
    this.stopPresentationClock();
    this.animationStartedAtMs = performance.now();
    const schedule = () => {
      this.animationTimer = setTimeout(() => {
        this.animationTimer = null;
        if (this.state !== GameState.Game || this.gameFinished) return;
        this.requestRender();
        schedule();
      }, 100);
      this.animationTimer.unref?.();
    };
    schedule();
  }

  private stopPresentationClock(): void {
    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.animationTimer = null;
  }

  private getAnimationFrame(): AnimationFrame {
    const elapsedMs = Math.max(0, performance.now() - this.animationStartedAtMs);
    return {frame: Math.floor(elapsedMs / 100), elapsedMs};
  }

  private requestRender(): void {
    if (this.renderScheduled) return;
    this.renderScheduled = true;
    setImmediate(() => {
      this.renderScheduled = false;
      this.render(true, false);
    });
  }

  private recordTelemetry(event: string, data: Record<string, unknown> = {}): void {
    const belongsToNextTurn = event === 'player_action' ||
      (event === 'combat_result' && data.actorIsPlayer === true);
    this.telemetry.event(event, {
      turn: this.turnNumber + (belongsToNextTurn ? 1 : 0),
      floor: this.currentLevelIndex,
      ...data,
    });
  }

  private buildTelemetrySnapshot(): Record<string, unknown> | null {
    const player = this.player;
    const level = this.getCurrentLevel();
    if (!player || !level) return null;
    const threats = level.getNpcs().map(npc => {
      const visible = player.canSeeCharacter(npc);
      const action = npc.getPreviousAction();
      return {
        name: npc.getName(),
        position: npc.position,
        hp: npc.getHp(),
        maxHp: npc.getMaxHp(),
        distance: npc.position.manhattanDistanceTo(player.position),
        visible,
        active: action !== Action.Nothing,
        action: Action[action],
        ranged: Boolean(npc.equipment.weapon?.isRanged),
        caster: Boolean(npc.getSpellLogic()?.attack.length),
        states: Array.from(npc.states).map(state => ({
          name: state.getName(),
          turnsLeft: state.getTurnsLeft(),
        })),
      };
    }).filter(threat => threat.visible || threat.active);
    const visibleThreats = threats.filter(threat => threat.visible);
    const activeThreats = threats.filter(threat => threat.active);
    const openNeighbours = [
      player.position.up(),
      player.position.right(),
      player.position.down(),
      player.position.left(),
    ].filter(position => level.map.isNavigable(position)).length;
    return {
      player: {
        position: player.position,
        hp: player.getHp(),
        maxHp: player.getMaxHp(),
        mp: Math.floor(player.mp),
        maxMp: player.getMaxMp(),
        level: player.level,
        xp: player.xp,
        attributes: {
          strength: player.getStrength(),
          dexterity: player.getDexterity(),
          endurance: player.getEndurance(),
          wisdom: player.getWisdom(),
        },
        armorClass: player.getAC(),
        speed: player.getSpeed(),
        states: Array.from(player.states).map(state => ({
          name: state.getName(),
          turnsLeft: state.getTurnsLeft(),
        })),
        equipment: Object.fromEntries(Object.entries(player.equipment).map(([slot, item]) => [slot, item ? {
          name: item.getName(),
          stats: item.stats,
        } : null])),
        inventory: player.inventory.map(item => ({name: item.getName(), stats: item.stats})),
        knownSpells: Array.from(player.knownSpells).map(spell => spell.getName()),
      },
      terrain: {
        tile: level.map.getTile(player.position)?.constructor.name,
        openNeighbours,
        isChokePoint: openNeighbours <= 2,
        atmosphere: level.getAtmosphere(player.position) ?? null,
        groundItem: level.getItem(player.position)?.getName() ?? null,
      },
      threatSummary: {
        visible: visibleThreats.length,
        active: activeThreats.length,
        adjacent: visibleThreats.filter(threat => threat.distance === 1).length,
        visibleRanged: visibleThreats.filter(threat => threat.ranged).length,
        visibleCasters: visibleThreats.filter(threat => threat.caster).length,
      },
      threats,
    };
  }

  private tick(unlockAfterPresentation = false) {
    const playerBeforeNpcPhase = this.player ? {
      position: this.player.position,
      hp: this.player.getHp(),
      mp: Math.floor(this.player.mp),
    } : null;
    this.turnNumber++;
    const level = this.getCurrentLevel();
    if (!this.gameFinished) level?.tickAtmosphere();
    if (level) {
      for (const npc of [...level.getNpcs()]) {
        npc.tick();
        if (this.gameFinished) break;
      }
    }
    if (!this.gameFinished) this.player.tick();
    if (this.gameFinished) {
      this.recordTelemetry('turn', {
        playerBeforeNpcPhase,
        outcome: 'game-finished',
        snapshot: this.buildTelemetrySnapshot(),
      });
      this.pendingProjectiles = [];
      this.render();
      return;
    }
    this.recordTelemetry('turn', {
      playerBeforeNpcPhase,
      snapshot: this.buildTelemetrySnapshot(),
    });
    if (this.pendingProjectiles.length > 0) {
      this.isPresentingAction = true;
      this.player.makeUninteractive();
      this.presentPendingProjectiles(() => this.finishActionPresentation());
    } else {
      this.render();
      if (unlockAfterPresentation) this.finishActionPresentation();
    }
  }

  start() {
    this.renderer.hideCursor();
    this.renderer.clear();
    if (this.screenLayout.isSupported) this.resizeActiveOverlays();
    this.goToMainMenu();
  }

  private exit() {
    this.stopPresentationClock();
    this.cancelProjectiles();
    this.renderer.showCursor();
    process.exit(0);
  }

  private goToMainMenu() {
    this.stopPresentationClock();
    this.cancelProjectiles();
    this.player?.makeUninteractive();
    const slot = this.saveFile.inspect(this.saveCodec.validate.bind(this.saveCodec));
    this.mainMenu.setSaveState(slot.valid, slot.error);
    this.mainMenu?.makeInteractive();
    this.state = GameState.Menu;
    this.render();
  }

  private returnToMainMenu() {
    this.player = null;
    this.bookPopup?.makeUninteractive();
    this.bookPopup = null;
    if (this.inventory) {
      this.inventory.makeUninteractive();
      this.inventory = null;
    }
    if (this.levelUpWindow) {
      this.levelUpWindow.makeUninteractive();
      this.levelUpWindow = null;
    }
    if (this.spellBook) {
      this.spellBook.makeUninteractive();
      this.spellBook = null;
    }
    if (this.selectTarget) {
      this.selectTarget.makeUninteractive();
      this.selectTarget = null;
    }
    this.levelUpWindow = null;
    this.levels = [];
    this.currentLevelIndex = 0;
    this.generatedUniqueBookIds.clear();
    this.gameLog.clear();
    this.inputEmitter.clear(this);
    this.goToMainMenu();
  }

  private buildInventory(): Inventory {
    let activeItem: Item | undefined;
    let fallbackActiveIndex = 0;
    if (this.inventory) {
      activeItem = this.inventory.getSelectedItem();
      fallbackActiveIndex = this.inventory.getSelectedIndex();
    }
    const inventory = new Inventory(this.generateGameObjectContext(), activeItem, fallbackActiveIndex);
    inventory.resize(this.gameField.getWidth(), this.gameField.getHeight());
    return inventory;
  }

  private generateGameObjectContext(): Context {
    return {
      getCurrentMap: () => this.getCurrentLevel().map,
      getPlayer: () => this.player,
      getRenderer: () => this.gameField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
      recordEvent: this.recordTelemetry.bind(this),
      getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
      destroyNpc: this.destroyNpc.bind(this),
      getCurrentGameLevel: () => this.getCurrentLevel(),
      presentProjectile: this.queueProjectile.bind(this),
    };
  }

  private MAX_DUNGEON_LEVEL = 3;
  private levelGenerator = new LevelGenerator({
    getCurrentMap: () => this.getCurrentLevel().map,
    getPlayer: () => this.player,
    getRenderer: () => this.gameField,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
    recordEvent: this.recordTelemetry.bind(this),
    getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
    destroyNpc: this.destroyNpc.bind(this),
    getCurrentGameLevel: () => this.getCurrentLevel(),
    presentProjectile: this.queueProjectile.bind(this),
  }, this.gameField.getWidth(), this.gameField.getHeight());
  private newGame(restored?: {
    player: Player;
    levels: Level[];
    currentLevelIndex: number;
    generatedUniqueBookIds: Set<string>;
  }) {
    this.gameFinished = false;
    this.turnNumber = 0;
    this.mainMenu?.makeUninteractive();

    if (restored) {
      this.player = restored.player;
      this.levels = restored.levels;
      this.currentLevelIndex = restored.currentLevelIndex;
      this.generatedUniqueBookIds = restored.generatedUniqueBookIds;
    } else {
      this.generatedUniqueBookIds.clear();
      this.levels.push(this.levelGenerator.generateLevel(0));
      this.player = new Player(this.generateGameObjectContext(), this.getCurrentLevel().map.getInitialPosition());
      this.player.explore();
    }

    this.player.makeInteractive();
    this.recordTelemetry('game_start', {
      restored: Boolean(restored),
      snapshot: this.buildTelemetrySnapshot(),
    });

    this.inputEmitter.on(InputEvent.I, this, () => {
      if (this.isPresentingAction) return;
      if (this.bookPopup) return;
      if (this.inventory) {
        this.closeInventory();
        this.render();
        return;
      }

      if (this.isGameFinished() || this.levelUpWindow || this.spellBook || this.selectTarget) {
        return;
      }
      this.inventory = this.buildInventory();
      this.player?.makeUninteractive();
      this.inventory.makeInteractive();
      this.gameLog.log(`[Enter] to equip/unequip, consume, or read; [d] to drop; [Escape] to exit inventory`);
      this.render();
    });

    this.inputEmitter.on(InputEvent.D, this, () => {
      if (this.isPresentingAction) return;
      if (this.bookPopup) return;
      if (this.inventory) {
        const item = this.inventory.getSelectedItem();
        if (item) {
          this.dropItem(item);
          this.inventory.makeUninteractive();
          this.inventory = this.buildInventory();
          this.inventory.makeInteractive();
          this.render();
        }
      }
    });

    this.inputEmitter.on(InputEvent.SPACE, this, () => {
      if (this.isPresentingAction) return;
      if (this.isGameFinished() || this.spellBook || this.inventory || this.levelUpWindow || this.selectTarget) {
        return;
      }
      this.recordTelemetry('player_action', {action: 'wait', position: this.player.position});
      this.tick();
    });

    this.inputEmitter.on(InputEvent.QUESTION, this, () => {
      if (this.isPresentingAction) return;
      if (!this.inventory && !this.spellBook) {
        this.displayHelp();
        this.render();
      }
    });

    this.inputEmitter.on(InputEvent.A, this, () => {
      if (this.isPresentingAction) return;
      if (this.selectTarget && !this.selectedSpell) {
        this.closeTargetSelection();
        this.render();
        return;
      }
      if (this.isGameFinished() || this.spellBook || this.inventory || this.levelUpWindow || this.selectTarget) {
        return;
      }
      if (!this.player.equipment.weapon?.isRanged) {
        this.gameLog.log(`You need an equipped ranged weapon to perform a ranged attack.`);
        this.render();
        return;
      }

      this.player?.makeUninteractive();
      this.selectTarget = new SelectTarget(this.generateGameObjectContext());
      this.resizeActiveOverlays();
      this.selectTarget.makeInteractive();
      this.render();
    });

    this.inputEmitter.on(InputEvent.ENTER, this, () => {
      if (this.isPresentingAction) return;
      if (this.gameFinished) {
        this.returnToMainMenu();
      } else if (this.bookPopup) {
        this.closeBook();
        this.render();
      } else if (this.inventory) {
        const item = this.inventory.getSelectedItem();
        if (item) {
          const equippedSlot = Object.entries(this.player.equipment).find(([, value]) => value === item)?.[0];
          if (item instanceof VeyranSurveyMap) {
            this.gameLog.log(`You study the ${item.getBaseName()}.`);
            const revealed = item.reveal();
            if (revealed === 0) {
              this.gameLog.log(`Its faded markings reveal nothing you have not already seen.`);
              this.render();
              return;
            }
            this.recordTelemetry('player_action', {
              action: 'read_map',
              item: item.getName(),
              revealedTiles: revealed,
            });
            this.gameLog.log(`Its faded markings reveal part of Emberdeep.`);
            this.player.inventory = this.player.inventory.filter(i => i !== item);
          } else if (item instanceof Book) {
            this.recordTelemetry('player_action', {action: 'read_book', item: item.getName()});
            this.openBook(item);
            this.tick();
            return;
          } else if (equippedSlot) {
            this.recordTelemetry('inventory_change', {
              action: 'unequip',
              slot: equippedSlot,
              item: item.getName(),
              stats: item.stats,
            });
            this.player.equipment[equippedSlot] = undefined;
          } else {
            if (item instanceof Weapon) {
              this.recordTelemetry('inventory_change', {action: 'equip', slot: 'weapon', item: item.getName(), stats: item.stats});
              this.player.equipment.weapon = item;
            } else if (item instanceof Chest) {
              this.recordTelemetry('inventory_change', {action: 'equip', slot: 'chest', item: item.getName(), stats: item.stats});
              this.player.equipment.chest = item;
            } else if (item instanceof Boots) {
              this.recordTelemetry('inventory_change', {action: 'equip', slot: 'boots', item: item.getName(), stats: item.stats});
              this.player.equipment.boots = item;
            } else if (item instanceof Gauntlets || item instanceof Bracelet) {
              this.recordTelemetry('inventory_change', {action: 'equip', slot: 'gauntlets', item: item.getName(), stats: item.stats});
              this.player.equipment.gauntlets = item;
            } else if (item instanceof Potion) {
              this.recordTelemetry('player_action', {action: 'drink_potion', item: item.getName(), stats: item.stats});
              this.gameLog.log(`You drank ${item.getName()}`);
              for (const [stat, value] of Object.entries(item.stats)) {
                switch (stat) {
                  case 'consumableHpReplenish':
                    this.player.hp = Math.min(this.player.hp + (value as number), this.player.getMaxHp());
                    this.gameLog.log(`You gained ${value} HP!`);
                    break;
                  case 'consumableMpReplenish':
                    this.player.mp = Math.min(this.player.mp + (value as number), this.player.getMaxMp());
                    this.gameLog.log(`You gained ${value} MP!`);
                    break;
                  case 'consumableState':
                    if (this.player.applyState(value as State)) {
                      this.gameLog.log((value as State).getActiveMessage(this.player));
                    }
                    break;
                  case 'consumableStateRemoval': {
                    const stateRemoval = value as {saveId: string};
                    const removedState = this.player.removeState(stateRemoval.saveId);
                    if (removedState) {
                      this.gameLog.log(removedState.getInactiveMessage(this.player));
                    } else {
                      this.gameLog.log(`${item.getBaseName()} had no effect!`);
                    }
                    break;
                  }
                  default:
                    break;
                }
              }
              this.player.inventory = this.player.inventory.filter(i => i !== item);
            } else if (item instanceof Scroll) {
              const spell = new item.spell();
              if (Array.from(this.player.knownSpells).find(s => s.getName() === spell.getName())) {
                this.gameLog.log(`${this.player.getName()} already knows this spell!`);
                this.render();
                return;
              }
              this.recordTelemetry('player_action', {
                action: 'learn_spell',
                item: item.getName(),
                spell: spell.getName(),
              });
              this.player.knownSpells.add(spell);
              this.gameLog.log(`${this.player.getName()} learned ${spell.getName()}!`);
              this.player.inventory = this.player.inventory.filter(i => i !== item);
            }
          }
          if (this.player.hp > this.player.getMaxHp()) {
            this.player.hp = this.player.getMaxHp();
          }
          if (this.player.mp > this.player.getMaxMp()) {
            this.player.mp = this.player.getMaxMp();
          }
          this.inventory?.makeUninteractive();
          this.inventory = this.buildInventory();
          this.inventory.makeInteractive();
          this.tick();
        }
        this.inventory?.makeUninteractive();
        this.inventory = this.buildInventory();
        if (!this.isPresentingAction) this.inventory.makeInteractive();
        this.render();
      } else if (this.spellBook || this.selectTarget) {
        // TODO
        // do nothing
      } else if (this.levelUpWindow) {
        return;
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsDownTile) {
        const fromFloor = this.currentLevelIndex;
        if (this.currentLevelIndex === this.levels.length - 1 && this.levels.length < this.MAX_DUNGEON_LEVEL + 1) {
          this.levels.push(this.levelGenerator.generateLevel(
            this.levels.length,
            this.levels[this.levels.length - 1],
            this.getUsedStatueInscriptions(),
          ));
        }
        this.currentLevelIndex++;
        this.recordTelemetry('floor_transition', {direction: 'down', fromFloor, toFloor: this.currentLevelIndex});
        this.player.explore();
        if (this.currentLevelIndex === 1) {
          this.gameLog.log(`You descend into Lantern Site Seven. Below, it is called Emberdeep.`);
        }
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsUpTile) {
        const fromFloor = this.currentLevelIndex;
        this.currentLevelIndex--;
        this.recordTelemetry('floor_transition', {direction: 'up', fromFloor, toFloor: this.currentLevelIndex});
        if (this.currentLevelIndex === 0) {
          this.gameLog.log(`Bright light hurts ${this.player.getName()}'s eyes!`);
        }
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof DeepEmberTile) {
        const guardianLives = this.getCurrentLevel().getNpcs().some(npc => npc instanceof EmberGuardian);
        if (guardianLives) {
          this.gameLog.log(`The Ember guardian's will seals the relic to its cradle.`);
          this.render();
        } else {
          this.finishVictory();
        }
      }
    });

    this.inputEmitter.on(InputEvent.ESCAPE, this, () => {
      if (this.isPresentingAction) return;
      if (this.pauseMenu) {
        this.closePauseMenu();
      } else if (this.bookPopup) {
        this.closeBook();
        this.render();
      } else if (this.inventory) {
        this.closeInventory();
        this.render();
      } else if (this.spellBook) {
        this.closeSpellBook();
        this.render();
      } else if (this.selectTarget) {
        this.closeTargetSelection();
        this.render();
      } else if (!this.levelUpWindow && !this.gameFinished) {
        this.openPauseMenu();
      }
    });

    this.inputEmitter.on(InputEvent.C, this, () => {
      if (this.isPresentingAction) return;
      if (this.spellBook) {
        this.closeSpellBook();
        this.render();
        return;
      }

      if (this.isGameFinished() || this.inventory || this.levelUpWindow || this.selectTarget) {
        return;
      }
      this.player?.makeUninteractive();
      this.spellBook = new SpellBook(this.generateGameObjectContext());
      this.resizeActiveOverlays();
      this.spellBook.makeInteractive();
      this.gameLog.log(`[spell key] or [Enter] to cast, [Escape] to exit spell book`);
      this.render();
    });

    if (restored) {
      this.gameLog.clear();
      this.gameLog.log(`Game restored.`);
    } else {
      this.gameLog.log(`You are a novice of the Order of the Lantern.`);
      this.gameLog.log(`Your charge is Lantern Site Seven, called Emberdeep below.`);
      this.gameLog.log(`Creatures from the Deep threaten the nearby villages.`);
      this.gameLog.log(`Recover the Deep Ember from the lowest depth.`);
      this.displayHelp();
    }

    this.state = GameState.Game;
    this.cancelProjectiles();
    this.startPresentationClock();
    this.render();
  }

  private finishVictory(): void {
    this.gameFinished = true;
    this.recordTelemetry('game_over', {
      outcome: 'victory',
      snapshot: this.buildTelemetrySnapshot(),
    });
    try { this.saveFile.delete(); } catch (e) { this.gameLog.log(`Could not delete save: ${e instanceof Error ? e.message : e}`); }
    this.gameLog.clear();
    this.gameLog.log(`You raise the Deep Ember from its ancient cradle.`);
    this.gameLog.log(`Its warmth fades from the stone, and Emberdeep begins to die.`);
    this.gameLog.log(`The villages are safe. Another darkness has been extinguished.`);
    this.gameLog.log(`The Order will be pleased.`);
    this.gameLog.log(`Your score is ${this.player.xp}. Press [Enter] to continue...`);
    this.player?.makeUninteractive();
    this.render();
    this.stopPresentationClock();
    this.cancelProjectiles();
  }

  private closeInventory() {
    this.inventory?.makeUninteractive();
    this.player.makeInteractive();
    this.inventory = null;
    this.gameLog.clear();
  }

  private openBook(book: Book): void {
    this.inventory?.makeUninteractive();
    this.bookPopup = new BookPopup(this.generateGameObjectContext(), book);
    this.resizeActiveOverlays();
    this.bookPopup.makeInteractive();
  }

  private closeBook(): void {
    this.bookPopup?.makeUninteractive();
    this.bookPopup = null;
    this.inventory?.makeInteractive();
  }

  private openPauseMenu(): void {
    this.player?.makeUninteractive();
    const [topLeft, bottomRight] = this.getCenteredPauseMenuBounds();
    this.pauseMenu = new List('Paused', [
      {id: 'resume', label: 'Resume', onSelect: () => this.closePauseMenu()},
      {id: 'save', label: 'Save Game', onSelect: () => this.receiveGameMessage(GameMessage.save())},
      {id: 'exit-save', label: 'Exit & Save', onSelect: () => this.receiveGameMessage(GameMessage.exitAndSave())},
    ], topLeft, bottomRight);
    this.pauseMenu.makeInteractive(this.renderer);
    this.render();
  }

  private getCenteredPauseMenuBounds(): [Position, Position] {
    const width = Math.min(Game.PAUSE_MENU_WIDTH, this.screenLayout.columns);
    const height = Math.min(Game.PAUSE_MENU_HEIGHT, this.screenLayout.rows);
    const left = Math.floor((this.screenLayout.columns - width) / 2);
    const top = Math.floor((this.screenLayout.rows - height) / 2);

    return [
      new Position(left, top),
      new Position(left + width - 1, top + height - 1),
    ];
  }

  private centerPauseMenu(): void {
    if (!this.pauseMenu) return;

    const [topLeft, bottomRight] = this.getCenteredPauseMenuBounds();
    this.pauseMenu.setBounds(topLeft, bottomRight);
  }

  private resizeActiveOverlays(): void {
    const width = this.gameField.getWidth();
    const height = this.gameField.getHeight();
    this.mainMenu.resize(this.screenLayout.columns, this.screenLayout.rows);
    this.inventory?.resize(width, height);
    this.spellBook?.resize(width, height);
    this.selectTarget?.resize(width, height);
    this.levelUpWindow?.resize(width, height);
    this.bookPopup?.resize(width, height);
  }

  private closePauseMenu(): void {
    this.pauseMenu?.makeUninteractive();
    this.pauseMenu = null;
    this.player?.makeInteractive();
    this.render();
  }

  private saveCurrentGame(exitAfterSave: boolean): void {
    if (!this.player || this.gameFinished) return;
    try {
      const data = this.saveCodec.serialize(
        this.player,
        this.levels,
        this.currentLevelIndex,
        this.generatedUniqueBookIds,
      );
      this.saveFile.write(data, this.saveCodec.validate.bind(this.saveCodec));
      this.gameLog.log('Game saved.');
      if (exitAfterSave) this.exit();
      else this.closePauseMenu();
    } catch (e) {
      this.gameLog.log(`Could not save game: ${e instanceof Error ? e.message : e}`);
      this.render();
    }
  }

  private loadGame(): void {
    try {
      this.mainMenu.makeUninteractive();
      const data = this.saveFile.read(this.saveCodec.validate.bind(this.saveCodec));
      const restored = this.saveCodec.restore(
        this.generateGameObjectContext(),
        data,
        this.gameField.getWidth(),
        this.gameField.getHeight(),
      );
      this.newGame(restored);
    } catch (e) {
      this.gameLog.clear();
      this.gameLog.log(`Could not load save: ${e instanceof Error ? e.message : e}`);
      this.goToMainMenu();
    }
  }

  private closeSpellBook() {
    this.spellBook?.makeUninteractive();
    this.player.makeInteractive();
    this.spellBook = null;
    this.gameLog.clear();
  }

  private closeTargetSelection(): void {
    this.selectTarget?.makeUninteractive();
    this.selectTarget = null;
    this.selectedSpell = null;
    this.player.makeInteractive();
    this.gameLog.clear();
  }

  private displayHelp() {
    this.gameLog.log(`Use arrows to move, [Space] to skip turn.`);
    this.gameLog.log(`Walk on the enemy to attack. Use [a] to perform ranged attack.`);
    this.gameLog.log(`Use [c] to cast spells.`);
    this.gameLog.log(`Use [i] to open inventory.`);
  }

  private renderMenu() {
    this.mainMenu.render();
  }

  private renderTransientEffects(frame: AnimationFrame): void {
    const now = performance.now();
    const map = this.getCurrentLevel().map;
    const topLeft = map.getTopLeftCorner();
    for (const effect of this.activeProjectiles) {
      const elapsed = now - effect.startedAtMs;
      const totalMs = effect.travelMs + effect.impactMs;
      if (elapsed < 0 || elapsed >= totalMs) continue;

      let worldPosition: Position;
      let char = effect.projectile.char;
      if (elapsed < effect.travelMs) {
        const progress = elapsed / effect.travelMs;
        const index = Math.min(effect.path.length - 1, Math.floor(progress * effect.path.length));
        worldPosition = effect.path[index];
      } else {
        worldPosition = effect.path[effect.path.length - 1];
        char = effect.impact === 'hit' ? '*' : effect.impact === 'miss' ? '.' : effect.projectile.char;
      }
      const tile = map.getTile(worldPosition);
      if (!tile?.isExplored() || this.player.isVisible(worldPosition) === null) continue;
      this.gameField.put(
        new Position(worldPosition.x - topLeft.x, worldPosition.y - topLeft.y),
        {
          char,
          color: effect.projectile.color,
          backgroundColor: tile.getChar(frame, worldPosition).backgroundColor,
        },
      );
    }
  }

  private renderGame(frame: AnimationFrame) {
    const borderColor = this.player.getHp() <= this.player.getMaxHp() * .25
      ? ForegroundColor.Red
      : ForegroundColor.White;
    this.gameField.setBorderColor(borderColor);
    this.menuField.setBorderColor(borderColor);
    this.logField.setBorderColor(borderColor);

    this.gameField.render(this.renderer);
    this.menuField.render(this.renderer);
    this.logField.render(this.renderer);

    this.gameLog.render(this.logField);

    this.healthBar.render();
    this.magicBar.render();
    this.levelBar.render();
    this.xpBar.render();
    this.playerStats.render();

    const level = this.getCurrentLevel();
    const usesFogOfWar = level.usesFogOfWar();
    level.map.render(this.gameField, frame);
    for (const [serializedPosition, item] of level.getItemsAndPositions()) {
      const position = Position.deserialize(serializedPosition);
      if ((!usesFogOfWar || this.player.canSeeTerrain(position)) && !level.getAtmosphere(position)) item.renderAt(position);
    }
    for (const npc of level.getNpcs()) {
      if ((!usesFogOfWar && !npc.isInvisible()) || this.player.canSeeCharacter(npc)) npc.render(frame);
    }
    const topLeft = level.map.getTopLeftCorner();
    for (const [serializedPosition, atmosphere] of level.getAtmosphereAndPositions()) {
      const position = Position.deserialize(serializedPosition);
      if (!this.player.canSeeTerrain(position)) continue;
      const tile = level.map.getTile(position);
      this.gameField.put(position.shift(-topLeft.x, -topLeft.y), {
        ...getAtmosphereChar(atmosphere, frame.frame),
        backgroundColor: tile.getChar(frame, position).backgroundColor,
      });
    }
    this.player.render(frame);
    this.renderTransientEffects(frame);
    if (this.inventory && !this.bookPopup) {
      this.inventory.render();
    }
    if (this.levelUpWindow) {
      this.levelUpWindow.render();
    }
    if (this.spellBook) {
      this.spellBook.render();
    }
    if (this.selectTarget) {
      this.selectTarget.render();
    }
    if (this.pauseMenu) {
      this.pauseMenu.render(this.renderer);
    }
    if (this.bookPopup) {
      this.bookPopup.render();
    }
  }

  private render(isBuffered = true, finishLogCycle = true) {
    if (this.isRendering) return;
    this.isRendering = true;
    try {
      if (!this.screenLayout.isSupported) {
        this.renderTerminalTooSmall();
        this.renderer.flush(isBuffered);
        return;
      }
      switch (this.state) {
        case GameState.Game:
          this.renderGame(this.getAnimationFrame());
          break;
        case GameState.Menu:
          this.renderMenu();
          break;
      }
      this.renderer.flush(isBuffered);
      if (finishLogCycle) this.gameLog.finishCycle();
    } finally {
      this.isRendering = false;
    }
  }

  private renderTerminalTooSmall(): void {
    const lines = [
      'Terminal too small',
      `Required: ${MIN_TERMINAL_COLUMNS} x ${MIN_TERMINAL_ROWS}`,
      `Current: ${this.screenLayout.columns} x ${this.screenLayout.rows}`,
      'Resize the terminal to continue. Ctrl-C exits.',
    ].slice(0, this.screenLayout.rows);
    const firstRow = Math.max(0, Math.floor((this.screenLayout.rows - lines.length) / 2));
    lines.forEach((line, index) => {
      const visibleLine = line.slice(0, this.screenLayout.columns);
      const left = Math.max(0, Math.floor((this.screenLayout.columns - visibleLine.length) / 2));
      for (let offset = 0; offset < visibleLine.length; offset++) {
        this.renderer.put(new Position(left + offset, firstRow + index), {
          char: visibleLine[offset],
          color: index === 0 ? ForegroundColor.Yellow : ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
      }
    });
  }

  // A* pathfinding: returns a path of Position[] from 'from' to 'to', or [] if no path.
  private buildPath(from: Position, to: Position, maxRadius, map = this.getCurrentLevel().map): Position[] {
    const canGo = (position: Position) =>
      position.equals(to) || position.equals(from) || map.isNavigable(position) && this.isFree(position);
    const serialize = (position: Position) => `${position.x},${position.y}`;
    type Node = {
      position: Position,
      g: number,
      h: number,
      f: number,
      parent: Node | null,
    };
    const openList: Map<string, Node> = new Map();
    openList.set(serialize(from), {
      position: from,
      g: 0,
      h: from.manhattanDistanceTo(to),
      f: from.manhattanDistanceTo(to),
      parent: null,
    })
    const closedList: Set<string> = new Set<string>();

    while (openList.size > 0) {
      const sorted = Array.from(openList.values()).sort((a, b) => a.f - b.f);
      let current = sorted[0];

      if (current.position.equals(to)) {
        const result: Position[] = [];
        while (current.parent) {
          result.unshift(current.position);
          current = current.parent;
        }
        result.pop();
        return result;
      }

      openList.delete(serialize(current.position));
      closedList.add(serialize(current.position));

      const neighbours = [
        current.position.up(),
        current.position.down(),
        current.position.left(),
        current.position.right(),
      ];
      for (const neighbour of neighbours) {
        if (closedList.has(serialize(neighbour))) {
          continue;
        }
        if (!canGo(neighbour)) {
          continue;
        }
        const g = current.g + 1;
        if (g >= maxRadius) {
          continue;
        }
        if (!openList.has(serialize(neighbour))) {
          openList.set(serialize(neighbour), {
            position: neighbour,
            g,
            h: neighbour.manhattanDistanceTo(to),
            f: g + neighbour.manhattanDistanceTo(to),
            parent: current,
          });
        } else if (openList.get(serialize(neighbour))!.f > g + neighbour.manhattanDistanceTo(to)) {
          openList.get(serialize(neighbour))!.f = g + neighbour.manhattanDistanceTo(to);
          openList.get(serialize(neighbour))!.parent = current;
        }
      }
    }
    return [];
  }
}

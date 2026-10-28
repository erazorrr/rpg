import {GameState} from "./game.state";
import {Renderer} from "../io/renderer";
import {Field} from "../io/field";
import * as process from "node:process";
import {Player} from "./player";
import {Position} from "../io/position";
import {MainMenu} from "./main-menu";
import {GameMessage, GameMessageType} from "./game-message";
import {Npc} from "./npc";
import {GameLog} from "./game-log";
import {HealthBar} from "./health-bar";
import {LevelBar} from "./level-bar";
import {XpBar} from "./xp-bar";
import {Item} from "./item";
import {Context} from "./context";
import {Inventory} from "./inventory";
import {InputEmitter} from "../io/input.emitter";
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
import {ExitTile} from "./tiles/exit.tile";
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

export class Game {
  private static readonly PAUSE_MENU_WIDTH = 50;
  private static readonly PAUSE_MENU_HEIGHT = 15;

  private state = GameState.Menu;
  private renderer = new Renderer();
  private inputEmitter = new InputEmitter();

  private player: Player | null = null;

  private inventory: Inventory | null = null;
  private spellBook: SpellBook | null = null;
  private selectTarget: SelectTarget | null = null;
  private levelUpWindow: LevelUpPopup | null = null;
  private pauseMenu: List | null = null;
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

  private levels: Level[] = [];
  private currentLevelIndex: number = 0;
  private getCurrentLevel(): Level {
    return this.levels[this.currentLevelIndex];
  }

  private gameField = new Field(
    'RPG',
    new Position(0, 0),
    new Position(process.stdout.columns - 31, process.stdout.rows - 1),
  );
  private menuField =  new Field(
    'Menu',
    new Position(process.stdout.columns - 30, 0),
    new Position(process.stdout.columns - 1, process.stdout.rows - 21),
  );
  private logField =  new Field(
    'Log',
    new Position(process.stdout.columns - 30, process.stdout.rows - 20),
    new Position(process.stdout.columns - 1, process.stdout.rows - 1),
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
    getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
    destroyNpc: this.destroyNpc.bind(this),
    getCurrentGameLevel: () => this.getCurrentLevel(),
  }, new Position(0, 0), new Position(process.stdout.columns - 1, process.stdout.rows - 1));

  constructor() {
    process.stdout.on('resize', () => {
      this.gameField.setRBPosition(new Position(process.stdout.columns - 31, process.stdout.rows - 1));

      this.menuField.setLTPosition(new Position(process.stdout.columns - 30, 0));
      this.menuField.setRBPosition(new Position(process.stdout.columns - 1, process.stdout.rows - 21));

      this.logField.setLTPosition(new Position(process.stdout.columns - 30, process.stdout.rows - 20));
      this.logField.setRBPosition(new Position(process.stdout.columns - 1, process.stdout.rows - 1));

      this.mainMenu.setRBPosition(new Position(process.stdout.columns - 1, process.stdout.rows - 1));

      this.centerPauseMenu();

      this.levelGenerator.setContainerSize(this.gameField.getWidth(), this.gameField.getHeight());

      for (const level of this.levels) {
        level.map.setContainerSize(this.gameField.getWidth(), this.gameField.getHeight());
      }

      this.render(false);
    });
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

  private lootGenerator = new LootGenerator(this.generateGameObjectContext());
  private receiveGameMessage(message: GameMessage): void {
    switch (message.type) {
      case GameMessageType.StartLevelUp:
        this.levelUpWindow = new LevelUpPopup(this.generateGameObjectContext());
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
        this.player.addXp(target.getXp() * target.getMultiplier());
        this.gameLog.log(`Earned ${target.getXp()} XP!`);
        this.getCurrentLevel()?.removeNpc(target);
        const item = this.lootGenerator.generateLoot(target.getLootCost());
        if (item) {
          if (this.dropLoot(item, target.position)) {
            this.gameLog.log(`${target.getName()} dropped ${item.getName()}!`);
          }
        }
        break;
      }
      case GameMessageType.Die:
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
          this.gameLog.log(`Picked ${item.getName()}. [i] to open inventory`);
          this.render();
        }
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
            this.player.applySpell(this.player, spell);
            this.player.makeInteractive();
            this.player.spendMP(spell.getMPCost());
            this.tick();
            break;
          case SpellTarget.Monster: {
            this.selectedSpell = spell;
            this.selectTarget = new SelectTarget(this.generateGameObjectContext());
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
    this.gameLog.log(`Dropped ${item.getName()}`);
  }

  private findPositionForLoot(position: Position): Position | null {
    let targetPosition = position;
    if (this.getCurrentLevel()?.getItem(targetPosition)) {
      // tile has an item already
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
    this.render();
  }

  private suspendPresentationInputs(): void {
    this.player?.makeUninteractive();
    this.inventory?.makeUninteractive();
    this.spellBook?.makeUninteractive();
    this.selectTarget?.makeUninteractive();
    this.levelUpWindow?.makeUninteractive();
    this.pauseMenu?.makeUninteractive();
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
          this.render();
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
      if (this.inventory) this.inventory.makeInteractive();
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
      this.render();
    });
  }

  private tick(unlockAfterPresentation = false) {
    const level = this.getCurrentLevel();
    if (level) {
      for (const npc of level.getNpcs()) {
        npc.tick();
        if (this.gameFinished) break;
      }
    }
    if (!this.gameFinished) this.player.tick();
    if (this.gameFinished) {
      this.pendingProjectiles = [];
      this.render();
      return;
    }
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
    this.gameLog.clear();
    this.inputEmitter.clear(this);
    this.goToMainMenu();
  }

  private buildInventory(): Inventory {
    let defaultActiveIndex = 0;
    if (this.inventory) {
      const currentItem = this.inventory.getSelectedItem();
      if (currentItem) {
        const currentItemIndex = this.player.inventory.findIndex(i => i === currentItem);
        if (currentItemIndex !== -1) {
          defaultActiveIndex = currentItemIndex;
        }
      }
    }
    return new Inventory(this.generateGameObjectContext(), defaultActiveIndex);
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
    getItem: (position: Position) => this.getCurrentLevel()?.getItem(position),
    destroyNpc: this.destroyNpc.bind(this),
    getCurrentGameLevel: () => this.getCurrentLevel(),
    presentProjectile: this.queueProjectile.bind(this),
  }, this.gameField.getWidth(), this.gameField.getHeight());
  private newGame(restored?: {player: Player, levels: Level[], currentLevelIndex: number}) {
    this.gameFinished = false;
    this.mainMenu?.makeUninteractive();

    if (restored) {
      this.player = restored.player;
      this.levels = restored.levels;
      this.currentLevelIndex = restored.currentLevelIndex;
    } else {
      this.levels.push(this.levelGenerator.generateLevel(0));
      this.player = new Player(this.generateGameObjectContext(), this.getCurrentLevel().map.getInitialPosition());
      this.player.explore();
    }

    this.player.makeInteractive();

    this.inputEmitter.on(InputEvent.I, this, () => {
      if (this.isPresentingAction) return;
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
      this.gameLog.log(`[Enter] to equip/unequip or consume, [d] to drop, [Escape] to exit inventory`);
      this.render();
    });

    this.inputEmitter.on(InputEvent.D, this, () => {
      if (this.isPresentingAction) return;
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
      if (this.isGameFinished() || this.spellBook || this.inventory || this.levelUpWindow || this.selectTarget) {
        return;
      }
      if (!this.player.equipment.weapon?.isRanged) {
        this.gameLog.log(`You need an equip ranged weapon to perform ranged attack`);
        this.render();
        return;
      }

      this.player?.makeUninteractive();
      this.selectTarget = new SelectTarget(this.generateGameObjectContext());
      this.selectTarget.makeInteractive();
      this.render();
    });

    this.inputEmitter.on(InputEvent.ENTER, this, () => {
      if (this.isPresentingAction) return;
      if (this.gameFinished) {
        this.returnToMainMenu();
      } else if (this.inventory) {
        const item = this.inventory.getSelectedItem();
        if (item) {
          const equippedSlot = Object.entries(this.player.equipment).find(([, value]) => value === item)?.[0];
          if (equippedSlot) {
            this.player.equipment[equippedSlot] = undefined;
          } else {
            if (item instanceof Weapon) {
              this.player.equipment.weapon = item;
            } else if (item instanceof Chest) {
              this.player.equipment.chest = item;
            } else if (item instanceof Boots) {
              this.player.equipment.boots = item;
            } else if (item instanceof Gauntlets || item instanceof Bracelet) {
              this.player.equipment.gauntlets = item;
            } else if (item instanceof Potion) {
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
                    this.player.applyState(value as State);
                    this.gameLog.log((value as State).getActiveMessage(this.player));
                    break;
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
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsDownTile) {
        if (this.currentLevelIndex === this.levels.length - 1 && this.levels.length < this.MAX_DUNGEON_LEVEL + 1) {
          this.levels.push(this.levelGenerator.generateLevel(this.levels.length, this.levels[this.levels.length - 1]));
          if (this.levels.length === this.MAX_DUNGEON_LEVEL + 1) {
            const position = this.levels[this.levels.length - 1].findTile(StairsDownTile);
            this.levels[this.levels.length - 1].map.setTile(position, new ExitTile());
          }
        }
        this.currentLevelIndex++;
        this.player.explore();
        if (this.currentLevelIndex === 1) {
          this.gameLog.log(`${this.player.getName()} has never seen such a dark place before!`);
        }
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsUpTile) {
        this.currentLevelIndex--;
        if (this.currentLevelIndex === 0) {
          this.gameLog.log(`Bright light hurts ${this.player.getName()}'s eyes!`);
        }
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof ExitTile) {
        this.gameFinished = true;
        try { this.saveFile.delete(); } catch (e) { this.gameLog.log(`Could not delete save: ${e instanceof Error ? e.message : e}`); }
        this.gameLog.log(`You win! Your score is ${this.player.xp}!`);
        this.gameLog.log(`Press [Enter] to continue...`);
        this.player?.makeUninteractive();
        this.render();
        this.stopPresentationClock();
        this.cancelProjectiles();
      }
    });

    this.inputEmitter.on(InputEvent.ESCAPE, this, () => {
      if (this.isPresentingAction) return;
      if (this.pauseMenu) {
        this.closePauseMenu();
      } else if (this.inventory) {
        this.closeInventory();
        this.render();
      } else if (this.spellBook) {
        this.closeSpellBook();
        this.render();
      } else if (this.selectTarget) {
        this.selectTarget.makeUninteractive();
        this.player.makeInteractive();
        this.selectTarget = null;
        this.gameLog.clear();
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
      this.spellBook.makeInteractive();
      this.gameLog.log(`[Enter] to select a spell, [Escape] to exit spell book`);
      this.render();
    });

    if (restored) {
      this.gameLog.clear();
      this.gameLog.log(`Game restored.`);
    } else {
      this.gameLog.log(`${this.player.getName()} found himself in an unknown place.`);
      this.displayHelp();
    }

    this.state = GameState.Game;
    this.cancelProjectiles();
    this.startPresentationClock();
    this.render();
  }

  private closeInventory() {
    this.inventory?.makeUninteractive();
    this.player.makeInteractive();
    this.inventory = null;
    this.gameLog.clear();
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
    const width = Math.min(Game.PAUSE_MENU_WIDTH, process.stdout.columns);
    const height = Math.min(Game.PAUSE_MENU_HEIGHT, process.stdout.rows);
    const left = Math.floor((process.stdout.columns - width) / 2);
    const top = Math.floor((process.stdout.rows - height) / 2);

    return [
      new Position(left, top),
      new Position(left + width - 1, top + height - 1),
    ];
  }

  private centerPauseMenu(): void {
    if (!this.pauseMenu) return;

    const [topLeft, bottomRight] = this.getCenteredPauseMenuBounds();
    this.pauseMenu.setLTPosition(topLeft);
    this.pauseMenu.setRBPosition(bottomRight);
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
      const data = this.saveCodec.serialize(this.player, this.levels, this.currentLevelIndex);
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
      if (!tile?.isExplored()) continue;
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
    level.map.render(this.gameField, frame);
    for (const [serializedPosition, item] of level.getItemsAndPositions()) {
      item.renderAt(Position.deserialize(serializedPosition));
    }
    this.player.render(frame);
    for (const npc of level.getNpcs()) {
      npc.render(frame);
    }
    this.renderTransientEffects(frame);
    if (this.inventory) {
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
  }

  private render(isBuffered = true) {
    if (this.isRendering) return;
    this.isRendering = true;
    try {
      switch (this.state) {
        case GameState.Game:
          this.renderGame(this.getAnimationFrame());
          break;
        case GameState.Menu:
          this.renderMenu();
          break;
      }
      this.renderer.flush(isBuffered);
    } finally {
      this.isRendering = false;
    }
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

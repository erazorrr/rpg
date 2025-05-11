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
import {FloorTile} from "./tiles/floor.tile";

export class Game {
  private state = GameState.Menu;
  private renderer = new Renderer();
  private inputEmitter = new InputEmitter();

  private player: Player | null = null;

  private inventory: Inventory | null = null;

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
    };
  }
  private healthBar = new HealthBar(this.generateMenuFieldContext());
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
  });

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

  private lootGenerator = new LootGenerator(this.generateGameObjectContext());
  private receiveGameMessage(message: GameMessage): void {
    switch (message.type) {
      case GameMessageType.NewGame:
        this.newGame();
        break;
      case GameMessageType.Exit:
        this.exit();
        break;
      case GameMessageType.Kill:
        const target = message.payload.character as Npc;
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
      case GameMessageType.Die:
        this.player.makeUninteractive();
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
      this.getCurrentLevel()?.putItem(position, item.clone());
      return true;
    }
    return false;
  }

  private tick() {
    for (const npc of this.getCurrentLevel()?.getNpcs()) {
      npc.tick();
    }
    this.render();
  }

  start() {
    this.renderer.hideCursor();
    this.goToMainMenu();
  }

  private exit() {
    this.renderer.showCursor();
    process.exit(0);
  }

  private goToMainMenu() {
    this.player?.makeUninteractive();
    this.mainMenu?.makeInteractive();
    this.state = GameState.Menu;
    this.render();
  }

  private returnToMainMenu() {
    this.player = null;
    this.inventory = null;
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
    };
  }

  private newGame() {
    this.mainMenu?.makeUninteractive();

    const levelGenerator = new LevelGenerator({
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
    }, this.gameField.getWidth(), this.gameField.getHeight());
    this.levels.push(levelGenerator.generateLevel(0));
    this.player = new Player(this.generateGameObjectContext(), this.getCurrentLevel().map.getInitialPosition());

    this.player.makeInteractive();

    this.inputEmitter.on(InputEvent.I, this, () => {
      if (this.inventory) {
        return;
      }
      this.inventory = this.buildInventory();
      this.player.makeUninteractive();
      this.inventory.makeInteractive();
      this.gameLog.log(`[Enter] to equip/unequip or consume, [d] to drop, [Escape] to exit inventory`);
      this.render();
    });

    this.inputEmitter.on(InputEvent.D, this, () => {
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
      this.tick();
    })

    this.inputEmitter.on(InputEvent.ENTER, this, () => {
      if (this.player.hp === 0) {
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
            } else if (item instanceof Gauntlets) {
              this.player.equipment.gauntlets = item;
            } else if (item instanceof Potion) {
              this.gameLog.log(`You drank ${item.getName()}`);
              for (const [stat, value] of Object.entries(item.stats)) {
                switch (stat) {
                  case 'consumableHpReplenish':
                    this.player.hp = Math.min(this.player.hp + (value as number), this.player.getMaxHp());
                    this.gameLog.log(`You gained ${value} HP!`);
                    break;
                  default:
                    break;
                }
              }
              this.player.inventory = this.player.inventory.filter(i => i !== item);
            }
          }
          if (this.player.hp > this.player.getMaxHp()) {
            this.player.hp = this.player.getMaxHp();
          }
          this.inventory.makeUninteractive();
          this.inventory = this.buildInventory();
          this.inventory.makeInteractive();
          this.tick();
        }
        this.inventory.makeUninteractive();
        this.inventory = this.buildInventory();
        this.inventory.makeInteractive();
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsDownTile) {
        if (this.currentLevelIndex === this.levels.length - 1 && this.levels.length < 4) {
          this.levels.push(levelGenerator.generateLevel(this.levels.length, this.levels[this.levels.length - 1]));
          if (this.levels.length === 4) { // last level
            const position = this.levels[this.levels.length - 1].findTile(StairsDownTile);
            this.levels[this.levels.length - 1].map.setTile(position, new FloorTile());
          }
        }
        this.currentLevelIndex++;
        this.player.explore();
        if (this.currentLevelIndex === 1) {
          this.gameLog.log(`${this.player.getName()} has never seen such a dark place before!`);
        }
        this.render();
      } else if (this.getCurrentLevel().map.getTile(this.player.position) instanceof StairsUpTile) {
        this.gameLog.log(`${this.player.getName()} is ascending...`);
        this.currentLevelIndex--;
        if (this.currentLevelIndex === 0) {
          this.gameLog.log(`Bright light hurts ${this.player.getName()}'s eyes!`);
        }
        this.render();
      }
    });

    this.inputEmitter.on(InputEvent.ESCAPE, this, () => {
      if (this.inventory) {
        this.inventory.makeUninteractive();
        this.player.makeInteractive();
        this.inventory = null;
        this.gameLog.clear();
        this.render();
      }
    });

    this.gameLog.log(`${this.player.getName()} found himself in an unknown place. Use arrows to move, [Space] to skip turn. Walk on the enemy to attack`);

    this.state = GameState.Game;
    this.render();
  }

  private renderMenu() {
    this.mainMenu.render();
  }

  private renderGame() {
    this.gameField.render(this.renderer);
    this.menuField.render(this.renderer);
    this.logField.render(this.renderer);

    this.gameLog.render(this.logField);

    this.healthBar.render();
    this.levelBar.render();
    this.xpBar.render();
    this.playerStats.render();

    this.getCurrentLevel().map.render(this.gameField);
    for (const [serializedPosition, item] of this.getCurrentLevel()?.getItemsAndPositions()) {
      item.renderAt(Position.deserialize(serializedPosition));
    }
    this.player.render();
    for (const npc of this.getCurrentLevel()?.getNpcs()) {
      npc.render();
    }
    if (this.inventory) {
      this.inventory.render();
    }
  }

  private render() {
    switch (this.state) {
      case GameState.Game:
        this.renderGame();
        break;
      case GameState.Menu:
        this.renderMenu();
        break;
    }
    this.renderer.flush();
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
      h: from.distanceTo(to),
      f: from.distanceTo(to),
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
            h: neighbour.distanceTo(to),
            f: g + neighbour.distanceTo(to),
            parent: current,
          });
        } else if (openList.get(serialize(neighbour))!.f > g + neighbour.distanceTo(to)) {
          openList.get(serialize(neighbour))!.f = g + neighbour.distanceTo(to);
          openList.get(serialize(neighbour))!.parent = current;
        }
      }
    }
    return [];
  }
}

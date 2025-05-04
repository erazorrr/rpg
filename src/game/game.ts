import {GameState} from "./game.state";
import {Renderer} from "../io/renderer";
import {Field} from "../io/field";
import * as process from "node:process";
import {GameMap} from "./game.map";
import {Player} from "./player";
import {Position} from "../io/position";
import {MainMenu} from "./main-menu";
import {GameMessage, GameMessageType} from "./game-message";
import {Npc} from "./npc";
import {Goblin} from "./monsters/goblin";
import {CharacterGameObject} from "./character.game-object";
import {GameLog} from "./game-log";
import {HealthBar} from "./health-bar";
import {Wolf} from "./monsters/wolf";
import {LevelBar} from "./level-bar";
import {XpBar} from "./xp-bar";

export class Game {
  private state = GameState.Menu;
  private renderer = new Renderer();

  private map: GameMap | null = null;
  private player: Player | null = null;

  private npcs: Npc[] = [];

  private gameLog: GameLog = new GameLog(30);

  private gameField = new Field(
    'RPG',
    new Position(0, 0),
    new Position(process.stdout.columns - 31, process.stdout.rows),
  );
  private menuField =  new Field(
    'Menu',
    new Position(process.stdout.columns - 30, 0),
    new Position(process.stdout.columns - 1, process.stdout.rows - 21),
  );
  private logField =  new Field(
    'Log',
    new Position(process.stdout.columns - 30, process.stdout.rows - 20),
    new Position(process.stdout.columns - 1, process.stdout.rows),
  );

  private healthBar = new HealthBar({
    getCurrentMap: () => this.map,
    getPlayer: () => this.player,
    getRenderer: () => this.menuField,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
  });
  private levelBar = new LevelBar({
    getCurrentMap: () => this.map,
    getPlayer: () => this.player,
    getRenderer: () => this.menuField,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
  });
  private xpBar = new XpBar({
    getCurrentMap: () => this.map,
    getPlayer: () => this.player,
    getRenderer: () => this.menuField,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
  });

  private mainMenu = new MainMenu({
    getCurrentMap: () => this.map,
    getPlayer: () => this.player,
    getRenderer: () => this.renderer,
    postGameMessage: this.receiveGameMessage.bind(this),
    tick: this.tick.bind(this),
    getIsFree: this.isFree.bind(this),
    buildPath: this.buildPath.bind(this),
    getCharacter: this.getCharacterAt.bind(this),
    log: this.gameLog.log.bind(this.gameLog),
  });

  private getCharacterAt(position: Position) {
    if (position.equals(this.player.position)) {
      return this.player;
    }
    for (const npc of this.npcs) {
      if (npc.position.equals(position)) {
        return npc;
      }
    }
    return null;
  }

  private isFree(position: Position): boolean {
    return this.getCharacterAt(position) === null;
  }

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
        this.player.addXp(target.getXp());
        this.gameLog.log(`Earned ${target.getXp()} XP!`);
        this.npcs = this.npcs.filter(npc => npc !== target);
        break;
      case GameMessageType.Die:
        this.player.makeUninteractive();
        break;
    }
  }

  private tick() {
    for (const npc of this.npcs) {
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

  private newGame() {
    this.mainMenu?.makeUninteractive();

    this.map = new GameMap({
      getCurrentMap: () => this.map,
      getPlayer: () => this.player,
      getRenderer: () => this.gameField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
    }, this.gameField.getWidth(), this.gameField.getHeight());
    this.player = new Player({
      getCurrentMap: () => this.map,
      getPlayer: () => this.player,
      getRenderer: () => this.gameField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
    }, this.map.getInitialPosition());

    this.player.makeInteractive();

    for (let i = 0; i < 200; i++) {
      let position: Position;
      while (!position) {
        const x = Math.floor(Math.random() * this.map.WIDTH);
        const y = Math.floor(Math.random() * this.map.HEIGHT);
        position = new Position(x, y);
        if (!this.map.getTile(position).isNavigable()) {
          position = null;
        }
      }
      const npcs = [
        Goblin,
        Wolf,
      ];
      this.npcs.push(new npcs[Math.floor(Math.random() * npcs.length)]({
        getCurrentMap: () => this.map,
        getPlayer: () => this.player,
        getRenderer: () => this.gameField,
        postGameMessage: this.receiveGameMessage.bind(this),
        tick: this.tick.bind(this),
        getIsFree: this.isFree.bind(this),
        buildPath: this.buildPath.bind(this),
        getCharacter: this.getCharacterAt.bind(this),
        log: this.gameLog.log.bind(this.gameLog),
      }, position));
    }

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
    this.renderer.flush();

    this.gameLog.render(this.logField);
    this.logField.flush();

    this.healthBar.render();
    this.levelBar.render();
    this.xpBar.render();
    this.menuField.flush();

    this.map.render(this.gameField);
    this.player.render();
    for (const npc of this.npcs) {
      npc.render();
    }
    this.gameField.flush();
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
  }


  // A* pathfinding: returns a path of Position[] from 'from' to 'to', or [] if no path.
  private buildPath(from: Position, to: Position, maxRadius = Infinity): Position[] {
    const canGo = (position: Position) =>
      position.equals(to) || position.equals(from) || this.map.isNavigable(position) && this.isFree(position);
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

import {GameState} from "./game.state";
import {Renderer} from "../io/renderer";
import {Field} from "../io/field";
import * as process from "node:process";
import {GameMap} from "./game.map";
import {Player} from "./player";
import {Position, SerializedPosition} from "../io/position";
import {MainMenu} from "./main-menu";
import {GameMessage, GameMessageType} from "./game-message";
import {Npc} from "./npc";
import {Goblin} from "./monsters/goblin";
import {GameLog} from "./game-log";
import {HealthBar} from "./health-bar";
import {Wolf} from "./monsters/wolf";
import {LevelBar} from "./level-bar";
import {XpBar} from "./xp-bar";
import {Item} from "./item";
import {ShortSword} from "./items/weapons/short-sword";
import {GreatAxe} from "./items/weapons/great-axe";
import {CopperModifier} from "./item-modifiers/weapon/material/copper";
import {IronModifier} from "./item-modifiers/weapon/material/iron";
import {SteelModifier} from "./item-modifiers/weapon/material/steel";
import {ItemModifier} from "./item-modifier";
import {Context} from "./context";
import {Inventory} from "./inventory";
import {InputEmitter} from "../io/input.emitter";
import {InputEvent} from "../io/input.event";
import {Weapon} from "./items/weapons/weapon";
import {LeatherArmor} from "./items/chest/leather-armor";
import {NopModifier} from "./item-modifiers/nop";
import {ChainMail} from "./items/chest/chain-mail";
import {CopperArmorModifier} from "./item-modifiers/armor/material/copper";
import {IronArmorModifier} from "./item-modifiers/armor/material/iron";
import {SteelArmorModifier} from "./item-modifiers/armor/material/steel";
import {Chest} from "./items/chest/chest";
import {HealthPotion} from "./items/potions/health";
import {Potion} from "./items/potions/potion";
import {LeatherBoots} from "./items/boots/leather-boots";
import {MetalBoots} from "./items/boots/metal-boots";
import {LeatherGauntlets} from "./items/gauntlets/leather-gauntlets";
import {MetalGauntlets} from "./items/gauntlets/metal-gauntlets";
import {Boots} from "./items/boots/boots";
import {Gauntlets} from "./items/gauntlets/gauntlets";
import {Health} from "./item-modifiers/health";
import {Endurance} from "./item-modifiers/endurance";
import {Dexterity} from "./item-modifiers/dexterity";
import {Strength} from "./item-modifiers/strength";
import {StrengthMonsterModifier} from "./monster-modufiers/strength";
import {EnduranceMonsterModifier} from "./monster-modufiers/endurance";
import {DexterityMonsterModifier} from "./monster-modufiers/dexterity";
import {AntiStrength} from "./item-modifiers/anti-strength";
import {AntiEndurance} from "./item-modifiers/anti-endurance";
import {AntiDexterity} from "./item-modifiers/anti-dexterity";
import {AntiHealth} from "./item-modifiers/anti-health";
import {SmallHealthPotion} from "./items/potions/small-health";
import {LargeHealthPotion} from "./items/potions/large-health";
import {Ogre} from "./monsters/ogre";
import {SpectralHitMonsterModifier} from "./monster-modufiers/spectral-hit";
import {Skeleton} from "./monsters/skeleton";

export class Game {
  private state = GameState.Menu;
  private renderer = new Renderer();
  private inputEmitter = new InputEmitter();

  private map: GameMap | null = null;
  private player: Player | null = null;

  private npcs: Npc[] = [];
  private items: Map<SerializedPosition, Item> = new Map();

  private inventory: Inventory | null = null;

  private gameLog: GameLog = new GameLog(30);

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

  private getItem(position: Position): Item | undefined {
    return this.items.get(position.serialize());
  }

  private generateMenuFieldContext(): Context {
    return {
      getCurrentMap: () => this.map,
      getPlayer: () => this.player,
      getRenderer: () => this.menuField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
      getItem: this.getItem.bind(this),
    };
  }
  private healthBar = new HealthBar(this.generateMenuFieldContext());
  private levelBar = new LevelBar(this.generateMenuFieldContext());
  private xpBar = new XpBar(this.generateMenuFieldContext());

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
    getItem: this.getItem.bind(this),
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
        this.player.addXp(target.getXp() * target.getMultiplier());
        this.gameLog.log(`Earned ${target.getXp()} XP!`);
        this.npcs = this.npcs.filter(npc => npc !== target);
        this.generateLoot(target.getName(), target.position, target.getLootCost());
        break;
      case GameMessageType.Die:
        this.player.makeUninteractive();
        break;
      case GameMessageType.PickUp: {
        const item = this.getItem(this.player.position);
        if (item) {
          if (this.player.inventory.length >= 14) {
            this.gameLog.log(`${this.player.getName()} can't carry any more items!`);
            this.render();
            return;
          }
          this.player.inventory.push(item);
          this.items.delete(this.player.position.serialize());
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

  private _items: Array<[Array<new (ctx: Context) => Item>, Array<new () => ItemModifier>, Array<new () => ItemModifier>]> = [
    [[ShortSword, GreatAxe], [CopperModifier, IronModifier, SteelModifier], [Health ,Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[LeatherArmor], [NopModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[ChainMail], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[HealthPotion], [NopModifier], [NopModifier, NopModifier, NopModifier, NopModifier, NopModifier, NopModifier]],
    [[SmallHealthPotion], [NopModifier], [NopModifier, NopModifier, NopModifier, NopModifier, NopModifier, NopModifier]],
    [[LargeHealthPotion], [NopModifier], [NopModifier, NopModifier, NopModifier, NopModifier, NopModifier, NopModifier]],
    [[LeatherBoots], [NopModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[MetalBoots], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[LeatherGauntlets], [NopModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
    [[MetalGauntlets], [CopperArmorModifier, IronArmorModifier, SteelArmorModifier], [Health, Endurance, Dexterity, Strength, AntiEndurance, AntiDexterity, AntiStrength, AntiHealth]],
  ];
  // TODO fix that
  private hasOpposites(arr: Array<ItemModifier>): boolean {
    const opposingModifiers: Record<string, string> = {
      Health: 'AntiHealth',
      AntiHealth: 'Health',
      Strength: 'AntiStrength',
      AntiStrength: 'Strength',
      Endurance: 'AntiEndurance',
      AntiEndurance: 'Endurance',
      Dexterity: 'AntiDexterity',
      AntiDexterity: 'Dexterity',
    };
    // Prevent adding both a modifier and its opposite
    let hasOpposites = false;
    for (let i = 0; i < arr.length; i++) {
      const modName = arr[i].name;
      const opposite = opposingModifiers[modName];
      if (
        opposite &&
        arr.some(
          (m, idx) => idx !== i && m.name === opposite
        )
      ) {
        hasOpposites = true;
        break;
      }
    }
    return hasOpposites;
  }
  private loot: Record<number, Array<Item>> = this._items.reduce((acc, [items, modifiers, modifiers1]) => {
    function* subsets(array, offset = 0) {
      while (offset < array.length) {
        let first = array[offset++];
        for (let subset of subsets(array, offset)) {
          subset.push(first);
          yield subset;
        }
      }
      yield [];
    }

    for (const item of items) {
      const base = new item(this.generateGameObjectContext());
      for (const modifier of modifiers) {
        const res = base.clone();
        res.applyModifier(new modifier());
        const cost = res.getCost();
        if (!acc[cost]) {
          acc[cost] = [];
        }
        acc[cost].push(res);

        // Mutually exclusive modifier pairs
        const opposingModifiers: Record<string, string> = {
          Health: 'AntiHealth',
          AntiHealth: 'Health',
          Strength: 'AntiStrength',
          AntiStrength: 'Strength',
          Endurance: 'AntiEndurance',
          AntiEndurance: 'Endurance',
          Dexterity: 'AntiDexterity',
          AntiDexterity: 'Dexterity',
        };
        for (const additionalModifiers of subsets(modifiers1)) {
          if (additionalModifiers.length > 2) {
            continue;
          }
          if (this.hasOpposites(additionalModifiers)) {
            continue;
          }

          const res1 = res.clone();
          for (const modifier1 of additionalModifiers) {
            res1.applyModifier(new modifier1());
          }
          const cost1 = res1.getCost();
          if (cost <= 0) {
            continue;
          }
          if (!acc[cost1]) {
            acc[cost1] = [];
          }
          acc[cost1].push(res1);
        }
      }
    }
    return acc;
  }, {});

  private findPositionForLoot(position: Position): Position | null {
    let targetPosition = position;
    if (this.items.has(targetPosition.serialize())) {
      // tile has an item already
      targetPosition = null;
      outer: for (let range = 1; range < 10; range++) {
        for (let i = position.x - range; i <= position.x + range; i++) {
          for (let j = position.y - range; j <= position.y + range; j++) {
            const position = new Position(i, j);
            if (!this.items.has(position.serialize()) && this.map.isNavigable(position)) {
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
      this.items.set(position.serialize(), item.clone());
      return true;
    }
    return false;
  }

  private generateLoot(npcName: string, position: Position, cost: number): number {
    let roll = Math.ceil(Math.random() * cost);
    let possibleItems: Item[];
    let change = 0;
    do {
      possibleItems = this.loot[roll];
      roll--;
      change++;
    } while (roll > 0 && !possibleItems);
    if (possibleItems) {
      const droppedLoot = possibleItems[Math.floor(Math.random() * possibleItems.length)];

      if (this.dropLoot(droppedLoot, position)) {
        this.gameLog.log(`${npcName} dropped ${droppedLoot.getName()}!`);
      }
    }
    return change;
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

  private buildInventory(): Inventory {
    return new Inventory(this.generateGameObjectContext());
  }

  private generateGameObjectContext(): Context {
    return {
      getCurrentMap: () => this.map,
      getPlayer: () => this.player,
      getRenderer: () => this.gameField,
      postGameMessage: this.receiveGameMessage.bind(this),
      tick: this.tick.bind(this),
      getIsFree: this.isFree.bind(this),
      buildPath: this.buildPath.bind(this),
      getCharacter: this.getCharacterAt.bind(this),
      log: this.gameLog.log.bind(this.gameLog),
      getItem: this.getItem.bind(this),
    };
  }

  private areas = [
    [30, 1, [Goblin, Wolf], []],
    [100, 30, [Goblin, Wolf], []],
    [300, 250, [Ogre, Goblin, Wolf], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier]],
    [500, 400, [Ogre, Skeleton, Goblin], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier, SpectralHitMonsterModifier]],
  ] as const;

  private generateNpcs() {
    let lastRange = 0;
    const startingPosition = this.map.getInitialPosition();
    for (const [range, npcCount, npcs, _modifiers] of this.areas) {
      for (let i = 0; i < npcCount; i++) {
        let position: Position;
        do {
          let x;
          if (Math.random() < 0.5) {
            x = startingPosition.x + lastRange + Math.floor(Math.random() * range);
          } else {
            x = startingPosition.x - lastRange - Math.floor(Math.random() * range);
          }
          let y;
          if (Math.random() < 0.5) {
            y = startingPosition.y + lastRange + Math.floor(Math.random() * range);
          } else {
            y = startingPosition.y - lastRange - Math.floor(Math.random() * range);
          }
          position = new Position(x, y);
        } while (!this.map.isNavigable(position) || !this.isFree(position));
        const npc = new npcs[Math.floor(Math.random() * npcs.length)](this.generateGameObjectContext(), position);
        const modifiersRoll = Math.floor(Math.random() * 100);
        let modifiersCount;
        if (modifiersRoll < 50) {
          modifiersCount = 0;
        } else if (modifiersRoll < 75) {
          modifiersCount = 1;
        } else if (modifiersRoll < 97) {
          modifiersCount = 2;
        } else {
          modifiersCount = 3;
        }
        const modifiers = [..._modifiers];
        for (let i = 0; i < modifiersCount; i++) {
          if (modifiers.length === 0) {
            break;
          }
          const idx = Math.floor(Math.random() * modifiers.length);
          const modifier = new (modifiers.splice(idx, 1)[0])();
          npc.applyModifier(modifier);
        }
        this.npcs.push(npc);
      }
      lastRange = range;
    }
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
      getItem: this.getItem.bind(this),
    }, this.gameField.getWidth(), this.gameField.getHeight());
    this.player = new Player(this.generateGameObjectContext(), this.map.getInitialPosition());

    this.player.makeInteractive();

    this.generateNpcs();

    this.inputEmitter.on(InputEvent.I, this, () => {
      if (this.inventory) {
        return;
      }
      this.inventory = this.buildInventory();
      this.player.makeUninteractive();
      this.inventory.makeInteractive();
      this.gameLog.log(`[Enter] to equip or consume, [d] to drop, [Escape] to exit inventory`);
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
      if (this.inventory) {
        const item = this.inventory.getSelectedItem();
        if (item) {
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

    this.map.render(this.gameField);
    for (const [serializedPosition, item] of this.items.entries()) {
      item.renderAt(Position.deserialize(serializedPosition));
    }
    this.player.render();
    for (const npc of this.npcs) {
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

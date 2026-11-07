import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";
import {Char} from "../io/char";
import {Interactive} from "./interactive.interface";
import {InputEvent} from "../io/input.event";
import {InputEmitter} from "../io/input.emitter";
import {Context} from "./context";
import {CharacterGameObject} from "./character.game-object";
import {GameMessage} from "./game-message";
import {Item} from "./item";
import {Equipment} from "./equipment";
import {ShortSword} from "./items/weapons/short-sword";
import {CopperModifier} from "./item-modifiers/weapon/material/copper";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {StairsUpTile} from "./tiles/stairs-up.tile";
import {Spell} from "./spell";
import {FireBoltSpell} from "./spells/fire-bolt";
import {Weapon} from "./items/weapons/weapon";
import {Bow} from "./items/weapons/bow";
import {MinorHealSpell} from "./spells/minor-heal";
import {Wand} from "./items/weapons/wand";
import {AntiWisdom} from "./item-modifiers/anti-wisdom";
import {AntiDexterity} from "./item-modifiers/anti-dexterity";
import {AntiStrength} from "./item-modifiers/anti-strength";
import {PlayerSave} from "./save-data";
import {restoreItem} from "./items/item.factory";
import {restoreSpell} from "./spells/spell.factory";
import {restoreState} from "./state.factory";
import {
  getDungeonBiomeAmbienceMessage,
  getDungeonBiomeDiscoveryMessage,
  getDungeonBiomeForFloor,
} from "./dungeon-generation/dungeon-biomes";
import {DungeonBiome} from "./dungeon-generation/dungeon-layout";
import {LootChestTile} from './tiles/loot-chest.tile';
import {CrystalClusterTile} from './tiles/crystal-cluster.tile';
import {PressureValveTile} from './tiles/pressure-valve.tile';
import {getOrderRank} from './order-rank';
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {FrostGeodeTile} from './tiles/frost-geode.tile';
import {AshUrnTile} from './tiles/ash-urn.tile';
import {LightGoesFirstBook} from './items/books/light-goes-first';
import {FrozenState} from './states/frozen.state';

export class Player extends CharacterGameObject implements Interactive {
  private static readonly INITIAL_AMBIENCE_COOLDOWN = 20;
  private static readonly AMBIENCE_COOLDOWN = 35;
  private static readonly AMBIENCE_CHANCE = .008;

  private inputEmitter = new InputEmitter();
  private movedSinceLastExplore = false;
  private biomeAmbienceCooldown = Player.INITIAL_AMBIENCE_COOLDOWN;

  public level = 1;
  public xp = 0;

  public nextLevelXp() {
    return Player.xpForNextLevel(this.level);
  }

  public static inferLevelFromXp(xp: number): number {
    let level = 1;
    while (xp >= Player.xpForNextLevel(level)) level++;
    return level;
  }

  private static xpForNextLevel(level: number): number {
    return level * level * level * 400 + 100;
  }

  public getMaxHp(): number {
    return super.getMaxHp() + 25;
  }
  public hp = this.getMaxHp();

  public addXp(xp: number): void {
    this.xp += xp;
    if (this.xp >= this.nextLevelXp()) {
      const previousRank = getOrderRank(this.level);
      this.level++;
      this.context.log(`${this.getName()} reached level ${this.level}!`);
      const rank = getOrderRank(this.level);
      if (rank !== previousRank) {
        this.context.log(`The Order recognizes you as ${rank === 'Initiate' ? 'an' : 'a'} ${rank}.`);
      }
      this.context.postGameMessage(GameMessage.startLevelUp());
    }
  }

  constructor(
    context: Context,
    position: Position,
    explore = true,
  ) {
    super(context, position);
    if (explore && this.context.getPlayer()) this.explore();
  }

  private moveTo(targetPosition: Position): void {
    const target = this.context.getCharacter(targetPosition);
    if (target) {
      this.context.recordEvent?.('player_action', {
        action: 'bump_attack',
        from: this.position,
        targetPosition,
        target: target.getName(),
        weapon: this.equipment.weapon?.getName() ?? 'unarmed',
      });
      this.attack(target);
      this.context.tick();
    } else if (this.canMove(targetPosition)) {
      this.context.recordEvent?.('player_action', {
        action: 'move',
        from: this.position,
        to: targetPosition,
      });
      this.moveToPosition(targetPosition);
      this.movedSinceLastExplore = true;
      if (this.context.getItem(targetPosition)) {
        this.context.log(`${this.getName()} sees ${this.context.getItem(targetPosition).getName()}. [p] to pick it up.`);
      }
      if (this.context.getCurrentMap().getTile(targetPosition) instanceof StairsDownTile) {
        this.context.log(`${this.getName()} sees the stairs down. [Enter] to descend.`);
      }
      if (this.context.getCurrentMap().getTile(targetPosition) instanceof StairsUpTile) {
        this.context.log(`${this.getName()} sees the stairs up. [Enter] to ascend.`);
      }
      if (this.context.getCurrentMap().getTile(targetPosition) instanceof DeepEmberTile) {
        this.context.log(`The Deep Ember burns in its cradle. [Enter] to recover it.`);
      }
      this.context.tick();
    } else {
      const tile = this.context.getCurrentMap().getTile(targetPosition);
      if (tile instanceof LootChestTile) {
        this.context.postGameMessage(GameMessage.openLootChest(tile, targetPosition));
        return;
      }
      if (tile instanceof CrystalClusterTile) {
        this.context.postGameMessage(GameMessage.shatterCrystal(targetPosition));
        return;
      }
      if (tile instanceof PressureValveTile) {
        this.context.postGameMessage(GameMessage.activatePressureValve(targetPosition));
        return;
      }
      if (tile instanceof FrostGeodeTile) {
        this.context.postGameMessage(GameMessage.shatterFrostGeode(targetPosition));
        return;
      }
      if (tile instanceof AshUrnTile) {
        this.context.postGameMessage(GameMessage.shatterAshUrn(targetPosition));
        return;
      }
      if (Array.from(this.states).some(state => state.saveId === FrozenState.saveId)) {
        this.context.recordEvent?.('player_action', {
          action: 'struggle_frozen',
          from: this.position,
          attempted: targetPosition,
        });
        this.context.log(`${this.getName()} struggles against the ice!`);
        this.context.tick();
        return;
      }
      this.context.recordEvent?.('player_action', {
        action: 'blocked_move',
        from: this.position,
        attempted: targetPosition,
      });
      for (const message of tile?.getBumpMessages() ?? []) {
        this.context.log(message);
      }
    }
  }

  protected moveToPosition(position: Position, traversed: Position[] = [position]): void {
    super.moveToPosition(position, traversed);
    for (const step of traversed) {
      const tile = this.context.getCurrentMap().getTile(step);
      if (!tile || tile.hasShownStepMessages()) continue;
      const messages = tile.getStepMessages();
      if (!messages.length) continue;
      tile.markStepMessagesShown();
      for (const message of messages) this.context.log(message);
    }
  }

  makeInteractive(): void {
    this.inputEmitter.on(InputEvent.ARROW_UP, this, () => {
      const targetPosition = this.position.up();
      this.moveTo(targetPosition);
    });
    this.inputEmitter.on(InputEvent.ARROW_DOWN, this, () => {
      const targetPosition = this.position.down();
      this.moveTo(targetPosition);
    });
    this.inputEmitter.on(InputEvent.ARROW_LEFT, this, () => {
      const targetPosition = this.position.left();
      this.moveTo(targetPosition);
    });
    this.inputEmitter.on(InputEvent.ARROW_RIGHT, this, () => {
      const targetPosition = this.position.right();
      this.moveTo(targetPosition);
    });
    this.inputEmitter.on(InputEvent.P, this, () => {
      this.context.postGameMessage(GameMessage.pickUp());
    })
  }

  makeUninteractive(): void {
    this.inputEmitter.clear(this);
  }

  private c: Char = {
    char: '@',
    color: ForegroundColor.White,
    backgroundColor: BackgroundColor.Black,
  }

  getChar(): Char {
    return this.c;
  }

  getBaseName(): string {
    return 'Hero';
  }

  public inventory: Item[] = [
    new ShortSword(this.context)
      .applyModifier(new CopperModifier())
      .applyModifier(new AntiWisdom())
      .applyModifier(new AntiDexterity()),
    new Bow(this.context)
      .applyModifier(new AntiWisdom())
      .applyModifier(new AntiStrength()),
    new Wand(this.context)
      .applyModifier(new AntiStrength())
      .applyModifier(new AntiDexterity()),
    new LightGoesFirstBook(this.context),
  ];
  public equipment: Equipment = {
    weapon: (this.inventory[0] as Weapon),
  };

  getIsBloody(): boolean {
    return true;
  }

  public explore() {
    const map = this.context.getCurrentMap();
    const visibleBiomes = new Set<DungeonBiome>();
    let discoveredBiome = false;

    for (let dx = -this.getVisibilityRadius(); dx <= this.getVisibilityRadius(); dx++) {
      for (let dy = -this.getVisibilityRadius(); dy <= this.getVisibilityRadius(); dy++) {
        const targetPosition = this.position.shift(dx, dy);
        const tile = map.getTile(targetPosition);

        if (tile && !tile.isExplored()) {
          if (this.position.manhattanDistanceTo(targetPosition) <= this.getVisibilityRadius()) {
            if (this.canSeeTerrain(targetPosition)) {
              tile.setExplored(true);
              const biome = getDungeonBiomeForFloor(tile);
              if (biome) visibleBiomes.add(biome);
            }
          }
        }
      }
    }

    const level = this.context.getCurrentGameLevel();
    for (const biome of visibleBiomes) {
      if (level.discoverDungeonBiome(biome)) {
        discoveredBiome = true;
        this.context.log(getDungeonBiomeDiscoveryMessage(biome));
      }
    }
    this.considerDungeonBiomeAmbience(discoveredBiome);
  }

  private considerDungeonBiomeAmbience(discoveredBiome: boolean): void {
    if (!this.movedSinceLastExplore) return;
    this.movedSinceLastExplore = false;

    const level = this.context.getCurrentGameLevel();
    const biome = getDungeonBiomeForFloor(level.map.getTile(this.position));
    if (!biome || discoveredBiome || level.getNpcs().some(npc => this.canSeeCharacter(npc))) return;

    if (this.biomeAmbienceCooldown > 0) {
      this.biomeAmbienceCooldown--;
      return;
    }
    if (Math.random() >= Player.AMBIENCE_CHANCE) return;

    this.context.log(getDungeonBiomeAmbienceMessage(biome));
    this.biomeAmbienceCooldown = Player.AMBIENCE_COOLDOWN;
  }

  public knownSpells: Set<Spell> = new Set([
    new FireBoltSpell(),
    new MinorHealSpell(),
  ]);

  public toSaveData(): PlayerSave {
    return {
      ...super.toSaveData(),
      level: this.level,
      xp: this.xp,
      inventory: this.inventory.map(item => item.toSaveData()),
      equipmentIndexes: Object.fromEntries(
        Object.entries(this.equipment).map(([slot, item]) => [
          slot,
          item ? this.inventory.indexOf(item) : undefined,
        ]),
      ),
      knownSpells: Array.from(this.knownSpells).map(spell => spell.saveId),
    };
  }

  public static fromSaveData(context: Context, data: PlayerSave): Player {
    const player = new Player(
      context,
      new Position(data.position.x, data.position.y),
      false,
    );
    player.strength = data.strength;
    player.dexterity = data.dexterity;
    player.endurance = data.endurance;
    player.wisdom = data.wisdom;
    player.states = new Set(data.states.map(restoreState));
    player.inventory = data.inventory.map(item => restoreItem(context, item));
    player.equipment = {};
    for (const [slot, index] of Object.entries(data.equipmentIndexes)) {
      if (
        index !== undefined &&
        (!Number.isInteger(index) || index < 0 || index >= player.inventory.length)
      ) {
        throw new Error('Invalid equipment reference');
      }
      if (index !== undefined) player.equipment[slot] = player.inventory[index];
    }
    player.hp = data.hp;
    player.mp = data.mp;
    player.level = data.level;
    player.xp = data.xp;
    player.knownSpells = new Set(data.knownSpells.map(restoreSpell));
    return player;
  }

  tick() {
    super.tick();
    this.explore();
  }
}

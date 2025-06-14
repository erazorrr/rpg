import {Renderable} from "../io/renderable.interface";
import {Position, SerializedPosition} from "../io/position";
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

export class Player extends CharacterGameObject implements Renderable, Interactive {
  private inputEmitter = new InputEmitter();

  public level = 1;
  public xp = 0;

  public nextLevelXp() {
    return this.level * this.level * this.level * 400 + 100;
  }

  public getMaxHp(): number {
    return super.getMaxHp() + 25;
  }
  public hp = this.getMaxHp();

  public addXp(xp: number): void {
    this.xp += xp;
    if (this.xp >= this.nextLevelXp()) {
      this.level++;
      this.context.log(`${this.getName()} reached level ${this.level}!`);
      this.context.postGameMessage(GameMessage.startLevelUp());
    }
  }

  constructor(
    context: Context,
    position: Position,
  ) {
    super(context, position);
    this.explore();
  }

  private moveTo(targetPosition: Position): void {
    if (this.context.getCharacter(targetPosition)) {
      this.attack(this.context.getCharacter(targetPosition));
      this.context.tick();
    } else if (this.canMove(targetPosition)) {
      this.position = targetPosition;
      if (this.context.getItem(targetPosition)) {
        this.context.log(`${this.getName()} sees ${this.context.getItem(targetPosition).getName()}. [p] to pick it up.`);
      }
      if (this.context.getCurrentMap().getTile(targetPosition) instanceof StairsDownTile) {
        this.context.log(`${this.getName()} sees the stairs down. [Enter] to descend.`);
      }
      if (this.context.getCurrentMap().getTile(targetPosition) instanceof StairsUpTile) {
        this.context.log(`${this.getName()} sees the stairs down. [Enter] to ascend.`);
      }
      this.context.tick();
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
  ];
  public equipment: Equipment = {
    weapon: (this.inventory[0] as Weapon),
  };

  getIsBloody(): boolean {
    return true;
  }

  private debugRenderTracings() {
    const map = this.context.getCurrentMap();
    setTimeout(() => {
      const alreadyRendered: Set<SerializedPosition> = new Set();
      for (let dx = -this.getVisibilityRadius(); dx <= this.getVisibilityRadius(); dx++) {
        for (let dy = -this.getVisibilityRadius(); dy <= this.getVisibilityRadius(); dy++) {
          const targetPosition = this.position.shift(dx, dy);
          const tile = map.getTile(targetPosition);
          if (this.context.getPlayer() && tile && Math.floor(this.context.getPlayer().position.manhattanDistanceTo(targetPosition)) === 10) {
            const visibilityPath = this.isVisible(targetPosition);
            const backgroundColor = Math.floor(Math.random() * 255);
            const color = Math.floor(Math.random() * 255);
            if (visibilityPath && !visibilityPath.find(_p => alreadyRendered.has(_p.serialize()))) {
              for (const p of visibilityPath) {
                this.context.getRenderer().put(new Position(p.x - map.getTopLeftCorner().x, p.y - map.getTopLeftCorner().y), {
                  char: 'X',
                  backgroundColor,
                  color,
                });
                alreadyRendered.add(p.serialize());
              }
            }
          }
        }
      }
      this.context.getRenderer().flush(true, false);
    }, 300);
  }

  public explore() {
    const map = this.context.getCurrentMap();

    for (let dx = -this.getVisibilityRadius(); dx <= this.getVisibilityRadius(); dx++) {
      for (let dy = -this.getVisibilityRadius(); dy <= this.getVisibilityRadius(); dy++) {
        const targetPosition = this.position.shift(dx, dy);
        const tile = map.getTile(targetPosition);

        if (tile && !tile.isExplored()) {
          if (this.position.manhattanDistanceTo(targetPosition) <= this.getVisibilityRadius()) {
            if (this.isVisible(targetPosition)) {
              tile.setExplored(true);
            }
          }
        }
      }
    }
  }

  public knownSpells: Set<Spell> = new Set([
    new FireBoltSpell(),
    new MinorHealSpell(),
  ]);

  tick() {
    super.tick();
    this.explore();
  }
}

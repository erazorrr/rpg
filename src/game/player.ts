import {Renderable} from "../io/renderable.interface";
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

export class Player extends CharacterGameObject implements Renderable, Interactive {
  private inputEmitter = new InputEmitter();

  public level = 1;
  public xp = 0;

  public nextLevelXp() {
    return Math.floor(Math.pow(2.5, this.level - 1)) * 100;
  }

  public getMaxHp(): number {
    return super.getMaxHp(Math.floor(this.level / 2) + 1);
  }
  public hp = this.getMaxHp();

  public addXp(xp: number): void {
    this.xp += xp;
    if (this.xp >= this.nextLevelXp()) {
      this.level++;
      this.context.log(`${this.getName()} reached level ${this.level}!`);
      this.endurance += 1;
      this.context.log(`${this.getName()}'s endurance is now ${this.endurance}!`);
      if (this.level % 4 === 0) {
        this.dexterity += 1;
        this.context.log(`${this.getName()}'s dexterity is now ${this.dexterity}!`);
      } else if (this.level % 2 === 0) {
        this.strength += 1;
        this.context.log(`${this.getName()}'s strength is now ${this.strength}!`);
      }
      this.hp = this.getMaxHp();
      this.context.log(`${this.getName()}'s hp restored to ${this.hp}!`);
    }
  }

  constructor(
    public context: Context,
    public position: Position,
  ) {
    super(context);
  }

  private moveTo(targetPosition: Position): void {
    if (this.context.getCharacter(targetPosition)) {
      this.attack(this.context.getCharacter(targetPosition));
    } else if (this.context.getCurrentMap().isNavigable(targetPosition)) {
      this.position = targetPosition;
      if (this.context.getItem(targetPosition)) {
        this.context.log(`${this.getName()} sees ${this.context.getItem(targetPosition).getName()}. [p] to pick it up.`);
      }
    }
    this.context.tick();
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
    new ShortSword(this.context).applyModifier(new CopperModifier()),
  ];
  public equipment: Equipment = {
    weapon: this.inventory[0],
  };

  getIsBloody(): boolean {
    return true;
  }
}

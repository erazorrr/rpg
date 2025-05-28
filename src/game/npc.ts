import {CharacterGameObject} from "./character.game-object";
import {Position} from "../io/position";
import {Context} from "./context";
import {Level} from "./level";
import {Spell} from "./spell";

export enum Action {
  Attack,
  Flee,
  Nothing
}

export abstract class Npc extends CharacterGameObject {
  abstract getXp(): number;
  abstract getBaseLootCost(): number;

  public constructor(context: Context, public gameLevel: Level, position: Position) {
    super(context, position);
  }

  getMultiplier() {
    return this.modifiers.reduce((acc, m) => acc * m.costMultiplicator, 1);
  }

  getLootCost(): number {
    const base = this.getBaseLootCost();
    return base * this.getMultiplier();
  }

  protected previousAction: Action = Action.Nothing;

  private step(path: Position[]): number {
    let speed = this.getSpeed() - 1;
    let restSpeed = 0;
    while (!path[speed] && speed > 0) {
      speed--;
      restSpeed++;
    }
    if (path[speed]) {
      this.position = path[speed];
      return restSpeed;
    }
    return restSpeed;
  }

  public tick() {
    super.tick();

    if (!this.isActive()) {
      return;
    }

    const player = this.context.getPlayer();

    const action = this.decideAction();
    this.previousAction = action;

    switch (action) {
      case Action.Attack: {
        if (this.getSpellLogic()) {
          const visibleNpcs: Npc[] = [];
          for (const npc of this.context.getCurrentGameLevel().getNpcs()) {
            if (this.isVisible(npc.position)) {
              visibleNpcs.push(npc);
            }
          }
          const spellArray: Array<{spell: Spell, target: CharacterGameObject}> = [];
          if (this.getSpellLogic().attack.length > 0 && this.isVisible(player.position)) {
            for (const spell of this.getSpellLogic().attack) {
              spellArray.push({spell, target: player});
            }
          }
          if (this.getSpellLogic().buffs.length > 0 && visibleNpcs.length > 0) {
            for (const spell of this.getSpellLogic().buffs) {
              for (const npc of visibleNpcs) {
                spellArray.push({spell, target: npc});
              }
            }
          }
          if (spellArray.length > 0) {
            const roll = Math.floor(Math.random() * spellArray.length);
            const {spell, target} = spellArray[roll];
            target.applySpell(this, spell);
          } else {
            if (this.isImmobile()) {
              return;
            }
            const path = this.context.buildPath(this.position, player.position, 100);
            const restSpeed = this.step(path);
            if (restSpeed > 0 && this.canAttack(player.position)) {
              this.attack(player);
            }
          }
        } else {
          if (this.canAttack(player.position)) {
            this.attack(player);
          } else {
            if (this.isImmobile()) {
              return;
            }
            const path = this.context.buildPath(this.position, player.position, 100);
            const restSpeed = this.step(path);
            if (restSpeed > 0 && this.canAttack(player.position)) {
              this.attack(player);
            }
          }
        }
        break;
      }
      case Action.Flee: {
        if (!this.isVisible(player.position)) {
          return;
        }
        if (Math.random() < 0.3) {
          this.spreadBlood();
        }
        if (this.isImmobile()) {
          return;
        }
        const start = this.position;
        const isRational = Math.random() < 0.8;
        if (isRational) {
          for (let i = 20; i >= 5; i--) {
            const vector = new Position(this.position.x - player.position.x, this.position.y - player.position.y).normalize();
            const goal = new Position(this.position.x + vector.x * i, this.position.y + vector.y * i);
            const path = this.context.buildPath(start, goal, 2 * i);
            if (this.step(path) < this.getSpeed() - 1) {
              break;
            }
          }
        } else {
          let newPosition;
          switch (Math.floor(Math.random() * 4)) {
            case 0: newPosition = this.position.up(); break;
            case 1: newPosition = this.position.down(); break;
            case 2: newPosition = this.position.left(); break;
            case 3: newPosition = this.position.right(); break;
          }
          if (this.context.getIsFree(newPosition) && this.canMove(newPosition)) {
            this.position = newPosition;
          }
        }
        break;
      }
      case Action.Nothing:
        break;
    }
  }

  abstract getCowardice(): number;

  protected getShout(): string {
    return `${this.getName()} shouts!`;
  }

  decideAction(): Action {
    const player = this.context.getPlayer();

    switch (this.previousAction) {
      case Action.Attack:
        if (this.hp <= this.getMaxHp() * this.getCowardice()) {
          this.context.log(`${this.getName()} tries to run!`);
          return Action.Flee;
        }
        return Action.Attack;
      case Action.Flee:
        return Action.Flee;
      default:
      case Action.Nothing:
        if (this.isVisible(player.position)) {
          if (this.hp <= this.getMaxHp() * this.getCowardice()) {
            this.context.log(`${this.getName()} tries to run!`);
            return Action.Flee;
          } else {
            this.context.log(this.getShout());
            return Action.Attack;
          }
        }
        return Action.Nothing;
    }
  }

  protected isActive() {
    return this.context.getCurrentGameLevel() === this.gameLevel;
  }

  getSpellLogic(): {
    buffs: Array<Spell>,
    attack: Array<Spell>,
  } | null {
    return null;
  }
}

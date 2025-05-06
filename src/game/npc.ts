import {CharacterGameObject} from "./character.game-object";
import {Position} from "../io/position";

export enum Action {
  Attack,
  Flee,
  Nothing
}

export abstract class Npc extends CharacterGameObject {
  abstract decideAction(): Action;
  abstract getXp(): number;
  abstract getBaseLootCost(): number;

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
    const player = this.context.getPlayer();

    const action = this.decideAction();
    this.previousAction = action;

    switch (action) {
      case Action.Attack: {
        if (this.canAttack(player.position)) {
          this.attack(player);
        } else {
          const start = this.position;
          const goal = player.position;
          const path = this.context.buildPath(start, goal, 100);
          const restSpeed = this.step(path);
          if (restSpeed > 0 && this.canAttack(player.position)) {
            this.attack(player);
          }
        }
        break;
      }
      case Action.Flee: {
        if (Math.random() < 0.3) {
          this.spreadBlood();
        }
        const start = this.position;
        const isRational = Math.random() < 0.8;
        if (isRational) {
          for (let i = 20; i >= 5; i--) {
            const goal = new Position(this.position.x + (this.position.x - player.position.x) * i, this.position.y + (this.position.y - player.position.y) * i);
            const path = this.context.buildPath(start, goal, 2 * i);
            if (this.step(path) < this.getSpeed() - 1) {
              break;
            }
          }
          const goal = new Position(this.position.x + (this.position.x - player.position.x) * 10, this.position.y + (this.position.y - player.position.y) * 10);
          const path = this.context.buildPath(start, goal, 20);
          this.step(path);
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
      }
      case Action.Nothing:
        break;
    }
  }
}

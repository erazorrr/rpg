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

  protected previousAction: Action = Action.Nothing;

  private step(path: Position[]) {
    let speed = this.getSpeed() - 1;
    while (!path[speed] && speed > 0) {
      speed--;
    }
    if (path[speed]) {
      this.position = path[speed];
    }
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
          this.step(path);
        }
        break;
      }
      case Action.Flee: {
        const start = this.position;
        const isRational = Math.random() < 0.8;
        if (isRational) {
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

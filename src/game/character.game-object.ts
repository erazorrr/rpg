import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {Renderable} from "../io/renderable.interface";
import {Char} from "../io/char";
import {GameMessage} from "./game-message";

export abstract class CharacterGameObject extends GameObject implements Renderable {
  public position: Position;

  protected strength = 10;
  protected endurance = 10;
  protected dexterity = 10;

  public getSpeed() {
    return Math.max(1, Math.floor((this.dexterity - 10) / 2) + 1);
  }

  public getMaxHp(): number {
    return this.endurance * 10;
  }
  public hp = this.getMaxHp();

  private getAC(): number {
    return 10 + Math.floor((this.dexterity - 10) / 2);
  }

  public canAttack(p: Position): boolean {
    return this.position.distanceTo(p) === 1;
  }

  public canMove(p: Position): boolean {
    if (this.position.distanceTo(p) !== 1) {
      return false;
    }
    if (!this.context.getCurrentMap().isNavigable(p)) {
      return false;
    }
  }

  abstract getName(): string;
  abstract getChar(): Char;

  render() {
    const map = this.context.getCurrentMap();
    const tile = map.getTile(this.position);
    this.context.getRenderer().put(new Position(this.position.x - map.getTopLeftCorner().x, this.position.y - map.getTopLeftCorner().y), {
      ...this.getChar(),
      backgroundColor: tile.getChar().backgroundColor,
    });
  };

  attack(target: CharacterGameObject): void {
    const ac = target.getAC();
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    if (attackRoll >= ac) {
      // hit
      const damageRoll = Math.max(Math.floor(Math.random() * 6) + 1 + Math.floor((this.strength - 10) / 2), 0);
      if (damageRoll === 0) {
        this.context.log(`${this.getName()} attacks ${target.getName()} for no damage!`);
      } else {
        this.context.log(`${this.getName()} attacks ${target.getName()} for ${damageRoll} damage!`);
        if (Math.random() < 0.5) {
          this.context.getCurrentMap().getTile(target.position).setBloody(true);
          [
            target.position.up(),
            target.position.down(),
            target.position.left(),
            target.position.right(),
          ].forEach(p => {
            if (Math.random() < 0.25) {
              this.context.getCurrentMap().getTile(p).setBloody(true);
            }
          });
        }
      }
      target.hp = Math.max(0, target.hp - damageRoll);
      if (target.hp === 0) {
        if (target === this.context.getPlayer()) {
          this.context.postGameMessage(GameMessage.die());
          this.context.log(`${target.getName()} is dead! Game over!`);
        } else {
          this.context.postGameMessage(GameMessage.kill(target));
          this.context.log(`${target.getName()} is dead!`);
        }
      }
    } else {
      this.context.log(`${this.getName()} attacks ${target.getName()} but misses!`);
    }
  }
}

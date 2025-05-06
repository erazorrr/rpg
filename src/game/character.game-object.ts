import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {Renderable} from "../io/renderable.interface";
import {Char} from "../io/char";
import {GameMessage} from "./game-message";
import {Equipment} from "./equipment";
import {MonsterModifier} from "./monster-modifier";
import {SpectralHitMonsterModifier} from "./monster-modufiers/spectral-hit";
import {Player} from "./player";

export abstract class CharacterGameObject extends GameObject implements Renderable {
  abstract getIsBloody(): boolean;

  public position: Position;

  protected strength: number = 10;
  protected endurance: number = 12;
  protected dexterity: number = 10;

  public equipment: Equipment = {};

  getStrength() {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.strengthBonus ? e.stats.strengthBonus : 0), 0);
    return this.strength + bonus;
  }

  getEndurance() {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.enduranceBonus ? e.stats.enduranceBonus : 0), 0);
    return this.endurance + bonus;
  }

  getDexterity() {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.dexterityBonus ? e.stats.dexterityBonus : 0), 0);
    return this.dexterity + bonus;
  }

  public getSpeed() {
    return Math.max(1, Math.floor((this.getDexterity() - 10) / 2) + 1);
  }

  public getMaxHp(): number {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.maxHp ? e.stats.maxHp : 0), 0);
    return 8 + this.getEndurance() * 2 + bonus;
  }
  public hp = this.getMaxHp();

  private getAC(): number {
    const base = this.equipment.chest ? this.equipment.chest.stats.armor : 10;
    const boots = this.equipment.boots ? this.equipment.boots.stats.armor : 0;
    const gauntlets = this.equipment.gauntlets ? this.equipment.gauntlets.stats.armor : 0;
    return base + boots + gauntlets + Math.floor((this.getDexterity() - 10) / 1.5);
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

  abstract getBaseName(): string;
  abstract getChar(): Char;

  render() {
    const map = this.context.getCurrentMap();
    const tile = map.getTile(this.position);
    this.context.getRenderer().put(new Position(this.position.x - map.getTopLeftCorner().x, this.position.y - map.getTopLeftCorner().y), {
      ...this.getChar(),
      backgroundColor: tile.getChar().backgroundColor,
    });
  };

  spreadBlood() {
    if (!this.getIsBloody()) {
      return;
    }

    this.context.getCurrentMap().getTile(this.position).setBloody(true);
    [
      this.position.up(),
      this.position.down(),
      this.position.left(),
      this.position.right(),
    ].forEach(p => {
      if (Math.random() < 0.15) {
        this.context.getCurrentMap().getTile(p).setBloody(true);
      }
    });
  }

  attack(target: CharacterGameObject): void {
    const ac = target.getAC();
    const attackRoll = Math.ceil(Math.random() * 30);
    if (attackRoll >= ac || this.modifiers.find(m => m instanceof SpectralHitMonsterModifier)) {
      // hit
      const dice = this.equipment.weapon ? this.equipment.weapon.stats.damageRoll : 4;
      const bonus = this.equipment.weapon ? this.equipment.weapon.stats.damageBonus : 0;
      const damageRoll = Math.ceil(Math.random() * dice);
      const strengthModifier = Math.floor((this.getStrength() - 10) / 2);
      const damage = Math.max(damageRoll + strengthModifier + bonus, 0);
      if (damage === 0) {
        this.context.log(`${this.getName()} attacks ${target.getName()} for no damage!`);
      } else {
        this.context.log(`${this.getName()} attacks ${target.getName()} for ${damage} damage!`);
        if (Math.random() * 10 < damage) {
          target.spreadBlood();
        }
      }
      target.hp = Math.max(0, target.hp - damage);
      if (target.hp === 0) {
        target.spreadBlood();
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

  protected modifiers: MonsterModifier[] = [];
  applyModifier(modifier: MonsterModifier) {
    this.modifiers.push(modifier);
    if (modifier.stats.strength) {
      this.strength += modifier.stats.strength;
    }
    if (modifier.stats.dexterity) {
      this.dexterity += modifier.stats.dexterity;
    }
    if (modifier.stats.endurance) {
      this.endurance += modifier.stats.endurance;
    }
    return this;
  }

  getName(): string {
    const prefix = this.modifiers
      .filter(m => !m.isSuffix)
      .map(m => m.name).join(" ");
    const suffix = this.modifiers
      .filter(m => m.isSuffix)
      .map(m => m.name).join(" ");
    return `${prefix ? `${prefix} ` : ''}${this.getBaseName()}${suffix ? ` ${suffix}` : ''}`;
  }
}

import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {Renderable} from "../io/renderable.interface";
import {Char} from "../io/char";
import {GameMessage} from "./game-message";
import {Equipment} from "./equipment";
import {MonsterModifier} from "./monster-modifier";
import {SpectralHitMonsterModifier} from "./monster-modufiers/spectral-hit";
import {Context} from "./context";
import {Debug} from "../debug";

export abstract class CharacterGameObject extends GameObject implements Renderable {
  private combatLog = new Debug('combat.log');

  abstract getIsBloody(): boolean;

  protected strength: number = 10;
  protected endurance: number = 12;
  protected dexterity: number = 10;

  public equipment: Equipment = {};

  constructor(context: Context, public position: Position) {
    super(context);
  }

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

  public getMaxHp(multiplier = 2): number {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.maxHp ? e.stats.maxHp : 0), 0);
    return Math.floor(8 + this.getEndurance() * multiplier + bonus);
  }
  public hp = this.getMaxHp();

  getAC(): number {
    const base = 5;
    const armor = this.equipment.chest ? this.equipment.chest.stats.armor : 0;
    const boots = this.equipment.boots ? this.equipment.boots.stats.armor : 0;
    const gauntlets = this.equipment.gauntlets ? this.equipment.gauntlets.stats.armor : 0;
    return Math.min(this.MAX_AC, base + armor + boots + gauntlets + Math.floor((this.getDexterity() - 10) * 0.5));
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
    this.context.getRenderer().put(
      new Position(this.position.x - map.getTopLeftCorner().x, this.position.y - map.getTopLeftCorner().y),
      tile.isExplored() ? {
        ...this.getChar(),
        backgroundColor: tile.getChar().backgroundColor,
      } : tile.getChar(),
    );
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

  getDamageDice(): number {
    return this.equipment.weapon ? this.equipment.weapon.stats.damageRoll : 4;
  }

  getDamageBonus(): number {
    const strengthModifier = Math.floor((this.getStrength() - 10) / 2);
    const weaponModifier =  this.equipment.weapon ? this.equipment.weapon.stats.damageBonus : 0;
    return strengthModifier + weaponModifier;
  }

  private ATTACK_ROLL = 30;
  public MAX_AC = this.ATTACK_ROLL - 5;
  attack(target: CharacterGameObject): void {
    this.combatLog.log(`${this.getName()}->${target.getName()}!`);
    const ac = target.getAC();
    this.combatLog.log(`AC ${ac}`);
    const attackRoll = Math.ceil(Math.random() * this.ATTACK_ROLL);
    this.combatLog.log(`AttackRoll ${attackRoll}`);
    if (attackRoll >= ac || this.modifiers.find(m => m instanceof SpectralHitMonsterModifier)) {
      // hit
      const dice = this.getDamageDice();
      const bonus = this.getDamageBonus();
      const damageRoll = Math.ceil(Math.random() * dice);
      this.combatLog.log(`DamageRoll ${damageRoll}`);
      const damage = Math.max(damageRoll + bonus, 0);
      this.combatLog.log(`Damage ${damage}`);
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
        this.combatLog.log(`Target is dead!`);
        target.spreadBlood();
        if (target === this.context.getPlayer()) {
          this.context.postGameMessage(GameMessage.die());
          this.context.log(`${target.getName()} is dead! Game over!`);
          this.context.log(`Press [Enter] to continue...`);
        } else {
          this.context.postGameMessage(GameMessage.kill(target));
          this.context.log(`${target.getName()} is dead!`);
        }
      }
    }
    else {
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

  protected getVisibilityRadius(): number {
    return 30;
  }
  public isVisible(targetPosition: Position): boolean {
    const map = this.context.getCurrentMap();

    if (this.position.equals(targetPosition)) {
      return true;
    }

    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    if (distance > this.getVisibilityRadius()) {
      return false;
    }

    if (distance === 1) {
      return true;
    }

    for (let i = 1; i < distance; i++) {
      const ratio = i / distance;
      const ix = Math.round(this.position.x + dx * ratio);
      const iy = Math.round(this.position.y + dy * ratio);
      const intermediatePosition = new Position(ix, iy);

      const intermediateTile = map.getTile(intermediatePosition);
      if (intermediateTile && !intermediateTile.isNavigable()) {
        return false;
      }
    }

    return true;
  }
}

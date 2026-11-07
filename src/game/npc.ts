import {CharacterGameObject} from "./character.game-object";
import {Position} from "../io/position";
import {Context} from "./context";
import {Level} from "./level";
import {Spell} from "./spell";
import {NpcSave} from "./save-data";
import {AtmosphereEmission} from './atmosphere';

export enum Action {
  Attack,
  Flee,
  Nothing
}

export abstract class Npc extends CharacterGameObject {
  public get saveId(): string {
    return (this.constructor as typeof Npc & {readonly saveId: string}).saveId;
  }

  abstract getXp(): number;
  abstract getBaseLootCost(): number;

  public constructor(context: Context, public gameLevel: Level, position: Position) {
    super(context, position);
  }

  protected getDepthHpBonus(): number {
    return Math.max(0, (this.gameLevel?.levelNo ?? 0) - 1) * 4;
  }

  public getMaxHp(multiplier = 2): number {
    return super.getMaxHp(multiplier) + this.getDepthHpBonus();
  }

  getMultiplier() {
    return this.modifiers.reduce((acc, m) => acc * m.costMultiplicator, 1);
  }

  getXpReward(): number {
    return Math.round(this.getXp() * this.getMultiplier());
  }

  getLootCost(): number {
    const base = this.getBaseLootCost();
    return base * this.getMultiplier();
  }

  protected previousAction: Action = Action.Nothing;
  protected lastSeenPlayerPosition: Position | null = null;

  public getPreviousAction(): Action {
    return this.previousAction;
  }

  public restorePreviousAction(action: Action): void {
    this.previousAction = action;
  }

  public restoreLastSeenPlayerPosition(position?: {x: number; y: number}): void {
    this.lastSeenPlayerPosition = position ? new Position(position.x, position.y) : null;
  }

  public getDeathAtmosphere(): AtmosphereEmission | null { return null; }

  protected getSelfSpell(): Spell | null { return null; }

  protected takeSpecialAction(): boolean { return false; }

  public toSaveData(): NpcSave {
    const character = super.toSaveData();
    for (const modifier of this.getModifiers()) {
      character.strength -= modifier.stats.strength ?? 0;
      character.dexterity -= modifier.stats.dexterity ?? 0;
      character.endurance -= modifier.stats.endurance ?? 0;
      if (modifier.stats.enduranceMultiplier) {
        character.endurance = Math.round(character.endurance / modifier.stats.enduranceMultiplier);
      }
      character.wisdom -= modifier.stats.wisdom ?? 0;
    }
    return {
      ...character,
      kind: this.saveId,
      previousAction: this.previousAction,
      modifiers: this.getModifiers().map(modifier => modifier.saveId),
      lastSeenPlayerPosition: this.lastSeenPlayerPosition ?? undefined,
    };
  }

  private step(path: Position[]): number {
    let speed = this.getSpeed() - 1;
    let restSpeed = 0;
    while (!path[speed] && speed > 0) {
      speed--;
      restSpeed++;
    }
    if (path[speed]) {
      this.moveToPosition(path[speed], path.slice(0, speed + 1));
      return restSpeed;
    }
    return restSpeed;
  }

  public tick() {
    super.tick();

    if (this.getHp() === 0) {
      return;
    }

    if (!this.isActive()) {
      return;
    }

    if (this.takeSpecialAction()) {
      return;
    }

    const player = this.context.getPlayer();

    const action = this.decideAction();
    this.previousAction = action;

    switch (action) {
      case Action.Attack: {
        const canSeePlayer = this.canSeeCharacter(player);
        if (canSeePlayer) this.lastSeenPlayerPosition = player.position;
        const selfSpell = this.getSelfSpell();
        if (selfSpell && canSeePlayer) {
          this.applySpell(this, selfSpell);
          break;
        }
        if (this.getSpellLogic() && canSeePlayer) {
          const visibleNpcs: Npc[] = [];
          for (const npc of this.context.getCurrentGameLevel().getNpcs()) {
            if (this.canSeeCharacter(npc)) {
              visibleNpcs.push(npc);
            }
          }
          const spellArray: Array<{spell: Spell, target: CharacterGameObject}> = [];
          if (this.getSpellLogic().attack.length > 0 && canSeePlayer) {
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
            const destination = canSeePlayer ? player.position : this.lastSeenPlayerPosition;
            if (!destination) break;
            const path = this.context.buildPath(this.position, destination, 100);
            const restSpeed = this.step(path);
            if (restSpeed > 0 && canSeePlayer && this.canAttack(player.position)) {
              this.attack(player);
            }
            if (!canSeePlayer && this.position.equals(destination)) this.previousAction = Action.Nothing;
          }
        } else {
          if (canSeePlayer && this.canAttack(player.position)) {
            this.attack(player);
          } else {
            if (this.isImmobile()) {
              return;
            }
            const destination = canSeePlayer ? player.position : this.lastSeenPlayerPosition;
            if (!destination) break;
            const path = this.context.buildPath(this.position, destination, 100);
            const restSpeed = this.step(path);
            if (restSpeed > 0 && canSeePlayer && this.canAttack(player.position)) {
              this.attack(player);
            }
            if (!canSeePlayer && this.position.equals(destination)) this.previousAction = Action.Nothing;
          }
        }
        break;
      }
      case Action.Flee: {
        const canSeePlayer = this.canSeeCharacter(player);
        const selfSpell = this.getSelfSpell();
        if (selfSpell && canSeePlayer) {
          this.applySpell(this, selfSpell);
          break;
        }
        if (!canSeePlayer) {
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
            this.moveToPosition(newPosition);
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

  protected getFleeMessage(): string {
    return `${this.getName()} tries to run!`;
  }

  decideAction(): Action {
    const player = this.context.getPlayer();

    switch (this.previousAction) {
      case Action.Attack:
        if (this.hp <= this.getMaxHp() * this.getCowardice()) {
          this.logIfObserved(this.getFleeMessage(), this);
          return Action.Flee;
        }
        return Action.Attack;
      case Action.Flee:
        return Action.Flee;
      default:
      case Action.Nothing:
        if (this.canSeeCharacter(player)) {
          this.lastSeenPlayerPosition = player.position;
          if (this.hp <= this.getMaxHp() * this.getCowardice()) {
            this.logIfObserved(this.getFleeMessage(), this);
            return Action.Flee;
          } else {
            this.logIfObserved(this.getShout(), this);
            return Action.Attack;
          }
        }
        return Action.Nothing;
    }
  }

  protected isActive() {
    return this.context.getCurrentGameLevel() === this.gameLevel;
  }

  public noticeAttackFrom(attacker: CharacterGameObject): void {
    if (attacker !== this.context.getPlayer()) return;
    this.lastSeenPlayerPosition = attacker.position;
    this.previousAction = Action.Attack;
  }

  getSpellLogic(): {
    buffs: Array<Spell>,
    attack: Array<Spell>,
  } | null {
    return null;
  }
}

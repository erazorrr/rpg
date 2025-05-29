import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {Renderable} from "../io/renderable.interface";
import {Char} from "../io/char";
import {GameMessage} from "./game-message";
import {Equipment} from "./equipment";
import {MonsterModifier} from "./monster-modifier";
import {SpectralHitMonsterModifier} from "./monster-modifiers/spectral-hit";
import {Context} from "./context";
import {Debug} from "../debug";
import {State} from "./state";
import {Spell} from "./spell";
import {BackgroundColor} from "../io/background.color";
import {ForegroundColor} from "../io/foreground.color";

export abstract class CharacterGameObject extends GameObject implements Renderable {
  private combatLog = new Debug('combat.log');

  abstract getIsBloody(): boolean;

  public strength: number = 10;
  public endurance: number = 12;
  public dexterity: number = 10;
  public wisdom: number = 10;

  public equipment: Equipment = {};

  public states: Set<State> = new Set();

  tick() {
    for (const state of this.states) {
      if (state.tick() === 0) {
        this.states.delete(state);
        this.context.log(state.getInactiveMessage(this));
      } else {
        if (state.stats.damagePerTurn) {
          this.damage(state.stats.damagePerTurn);
        }
      }
    }
  }

  constructor(context: Context, public position: Position) {
    super(context);
  }

  public getHp() {
    return Math.floor(this.hp);
  }

  damage(damage: number) {
    if (Math.random() * 10 < damage) {
      this.spreadBlood();
    }
    this.hp = Math.max(0, this.hp - damage);
    if (this.getHp() === 0) {
      if (this === (this.context.getPlayer() as CharacterGameObject)) {
        this.context.postGameMessage(GameMessage.die());
        this.context.log(`${this.getName()} is dead! Game over!`);
        this.context.log(`Press [Enter] to continue...`);
      } else {
        this.context.postGameMessage(GameMessage.kill(this));
        this.context.log(`${this.getName()} is dead!`);
      }
    }
  }

  getWisdom(withStates = true) {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.wisdomBonus ? e.stats.wisdomBonus : 0), 0);
    const states = withStates ? Array.from(this.states).reduce((acc, s) => acc + (s.stats?.wisdomBonus ?? 0), 0) : 0;
    return this.wisdom + bonus + states;
  }

  getStrength(withStates = true) {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.strengthBonus ? e.stats.strengthBonus : 0), 0);
    const states = withStates ? Array.from(this.states).reduce((acc, s) => acc + (s.stats?.strengthBonus ?? 0), 0) : 0;
    return this.strength + bonus + states;
  }

  getEndurance(withStates = true) {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.enduranceBonus ? e.stats.enduranceBonus : 0), 0);
    const states = withStates ? Array.from(this.states).reduce((acc, s) => acc + (s.stats?.enduranceBonus ?? 0), 0) : 0;
    return this.endurance + bonus + states;
  }

  getDexterity(withStates = true) {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.dexterityBonus ? e.stats.dexterityBonus : 0), 0);
    const states = withStates ? Array.from(this.states).reduce((acc, s) => acc + (s.stats?.dexterityBonus ?? 0), 0) : 0;
    return this.dexterity + bonus + states;
  }

  public getSpeed() {
    return Math.max(1, Math.floor((this.getDexterity() - 10) / 2) + 1);
  }

  public getMaxHp(multiplier = 2): number {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.maxHp ? e.stats.maxHp : 0), 0);
    return Math.floor(8 + this.getEndurance() * multiplier + bonus);
  }
  public hp = this.getMaxHp();

  public getMaxMp(multiplier = 2): number {
    const bonus = Object.values(this.equipment).reduce((acc, e) => acc + (e?.stats?.maxMp ? e.stats.maxMp : 0), 0);
    return Math.floor(32 + this.getWisdom() * multiplier + bonus);
  }
  public mp = this.getMaxMp();

  getAC(withStates = true): number {
    const base = 5;
    const armor = this.equipment.chest ? this.equipment.chest.stats.armor : 0;
    const boots = this.equipment.boots ? this.equipment.boots.stats.armor : 0;
    const gauntlets = this.equipment.gauntlets ? this.equipment.gauntlets.stats.armor : 0;
    const states = withStates ? Array.from(this.states).reduce((acc, s) => acc + (s.stats?.armor ?? 0), 0) : 0;
    return Math.min(this.MAX_AC, states + base + armor + boots + gauntlets + Math.floor((this.getDexterity() - 10) / 3));
  }

  public canAttack(p: Position): boolean {
    if (this.equipment.weapon?.isRanged) {
      return this.isVisible(this.context.getPlayer().position) !== null;
    } else {
      return this.position.manhattanDistanceTo(p) === 1;
    }
  }

  protected isImmobile(): boolean {
    return Boolean(Array.from(this.states).find(s => s.stats.isUnableToMove));
  }

  public canMove(p: Position): boolean {
    if (this.isImmobile()) {
      return false;
    }
    if (this.position.manhattanDistanceTo(p) !== 1) {
      return false;
    }
    if (!this.context.getCurrentMap().isNavigable(p)) {
      return false;
    }
    return true;
  }

  abstract getBaseName(): string;
  abstract getChar(): Char;

  render() {
    const map = this.context.getCurrentMap();
    const tile = map.getTile(this.position);

    let stateBackgroundColor: BackgroundColor | null = null;
    let stateForegroundColor: ForegroundColor | null = null;
    for (const state of this.states) {
      if (state.getBackgroundColor()) {
        stateBackgroundColor = state.getBackgroundColor();
      }
      if (state.getForegroundColor()) {
        stateForegroundColor = state.getForegroundColor();
      }
    }

    this.context.getRenderer().put(
      new Position(this.position.x - map.getTopLeftCorner().x, this.position.y - map.getTopLeftCorner().y),
      tile.isExplored() ? {
        ...this.getChar(),
        backgroundColor: stateBackgroundColor ? stateBackgroundColor : tile.getChar().backgroundColor,
        color: stateForegroundColor ? stateForegroundColor : this.getChar().color,
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
        this.context.getCurrentMap().getTile(p)?.setBloody(true);
      }
    });
  }

  getDamageDice(): number {
    return (this.equipment.weapon && this.equipment.weapon.stats.damageRoll) ?? 4;
  }

  getDamageBonus(): number {
    const weaponModifier = (this.equipment.weapon && this.equipment.weapon.stats.damageBonus) ?? 0;
    const attributeModifier = this.equipment.weapon?.isRanged
      ? Math.floor((this.getDexterity() - 10) / 4)
      : Math.floor((this.getStrength() - 10) / 2);
    return attributeModifier + weaponModifier;
  }

  getMagicDiceBonus(): number {
    return (this.equipment.weapon && this.equipment.weapon.stats.magicRoll) ?? 0;
  }

  getMagicBonus(): number {
    const wisdomModifier = Math.floor((this.getWisdom() - 10) / 2);
    const weaponModifier = (this.equipment.weapon && this.equipment.weapon.stats.magicBonus) ?? 0;
    return wisdomModifier + weaponModifier;
  }

  public ATTACK_ROLL = 50;
  public MAX_AC = this.ATTACK_ROLL - 5;
  attack(target: CharacterGameObject): void {
    this.combatLog.log(`${this.getName()}->${target.getName()}!`);
    if (this.equipment.weapon?.isRanged) {
      // rendering projectile
      const path = this.isVisible(target.position);
      this.context.getCurrentMap().renderProjectile(
        path,
        {
          char: '•',
          backgroundColor: BackgroundColor.Black,
          color: ForegroundColor.Grey50,
        }
      );
    }
    const ac = target.getAC();
    this.combatLog.log(`AC ${ac}`);
    const attackRoll = Math.ceil(Math.random() * this.ATTACK_ROLL);
    this.combatLog.log(`AttackRoll ${attackRoll}`);
    const verb = this.equipment.weapon?.isRanged ? 'shoots' : 'hits';
    if (attackRoll >= ac || this.modifiers.find(m => m instanceof SpectralHitMonsterModifier)) {
      // hit
      const dice = this.getDamageDice();
      const bonus = this.getDamageBonus();
      const damageRoll = Math.ceil(Math.random() * dice);
      this.combatLog.log(`DamageRoll ${damageRoll}`);
      const damage = Math.max(damageRoll + bonus, 0);
      this.combatLog.log(`Damage ${damage}`);
      if (damage === 0) {
        this.context.log(`${this.getName()} ${verb} ${target.getName()} for no damage!`);
      } else {
        this.context.log(`${this.getName()} ${verb} ${target.getName()} for ${damage} damage!`);
        target.damage(damage);
      }
      if (this.equipment.weapon?.stats?.hpPerHit) {
        this.hp = Math.min(this.hp + this.equipment.weapon.stats.hpPerHit, this.getMaxHp());
      }
      if (target.equipment.chest?.stats?.mpPerHitReceived) {
        target.mp = Math.min(target.mp + target.equipment.chest.stats.mpPerHitReceived, target.getMaxMp());
      }
    }
    else {
      this.context.log(`${this.getName()} ${verb} ${target.getName()} but misses!`);
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
    if (modifier.stats.wisdom) {
      this.wisdom += modifier.stats.wisdom;
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
  public isVisible(targetPosition: Position): Position[] | null {
    return super.isVisible(this.position, targetPosition, this.getVisibilityRadius());
  }

  applyState(state: State) {
    for (const existingState of this.states) {
      if (existingState.constructor === state.constructor || state.getIncompatibleStates().has(existingState.constructor as new () => State)) {
        this.states.delete(existingState);
      }
    }
    this.states.add(state);
  }

  applySpell(caster: CharacterGameObject, spell: Spell) {
    const projectile = spell.getProjectile();
    if (projectile) {
      const path = caster.isVisible(this.position);
      if (path) {
        this.context.getCurrentMap().renderProjectile(path, projectile);
      }
    }
    if (spell.stats.state && !spell.stats.damageRoll) {
      if (!spell.stats.stateChance || Math.random() < spell.stats.stateChance) {
        const state = (spell.stats.state)();
        this.context.log(state.getActiveMessage(this));
        this.applyState(state);
      }
    }
    if (spell.stats.restoreHp) {
      if (spell.stats.restoreHp > 0) {
        this.context.log(`${spell.getName()} restored ${this.getName()} ${spell.stats.restoreHp} health!`);
        this.hp = Math.min(this.getMaxHp(), this.hp + spell.stats.restoreHp);
      } else {
        this.context.log(`${spell.getName()} drained ${-spell.stats.restoreHp} health from ${this.getName()}!`);
        this.damage(-spell.stats.restoreHp);
      }
    }
    if (spell.stats.damageRoll && spell.stats.damageBonus) {
      this.combatLog.log(`Spell ${spell.getName()} on ${this.getName()}`);
      const ac = this.getAC();
      this.combatLog.log(`AC ${ac}`);
      const attackRoll = Math.ceil(Math.random() * this.ATTACK_ROLL);
      this.combatLog.log(`AttackRoll ${attackRoll}`);
      if (attackRoll >= ac) {
        const dice = spell.stats.damageRoll + caster.getMagicDiceBonus();
        const bonus = spell.stats.damageBonus + caster.getMagicBonus();
        const damageRoll = Math.ceil(Math.random() * dice);
        this.combatLog.log(`DamageRoll ${damageRoll}`);
        const damage = Math.max(damageRoll + bonus, 0);
        this.combatLog.log(`Damage ${damage}`);
        if (damage > 0) {
          this.context.log(`${spell.getName()} hits ${this.getName()} for ${damage} damage!`);
          this.damage(damage);
        } else {
          this.context.log(`${spell.getName()} hits ${this.getName()} for no damage!`);
        }

        if (spell.stats.state && spell.stats.stateChance) {
          if (Math.random() < spell.stats.stateChance) {
            const state = spell.stats.state();
            this.context.log(state.getActiveMessage(this));
            this.applyState(state);
          }
        }
      } else {
        this.context.log(`${spell.getName()} misses ${this.getName()}!`);
      }
    }
  }

  public spendMP(mp: number) {
    this.mp -= mp;
  }
}

import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
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
import {CharacterSave, Saveable} from "./save-data";
import {AnimationFrame, ProjectileImpact} from "./animation";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {StairsUpTile} from "./tiles/stairs-up.tile";
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {DamageType} from './damage';
import {ShallowWaterTile} from './tiles/shallow-water.tile';
import {SporePodTile} from './tiles/spore-pod.tile';
import {MoldFloorTile} from './tiles/mold-floor.tile';
import {BurningState} from './states/burning.state';
import {PoisonedState} from './states/poisoned.state';
import {ThornFungusTile} from './tiles/thorn-fungus.tile';
import {SearingGrateTile} from './tiles/searing-grate.tile';
import {EmberworksFloorTile} from './tiles/emberworks-floor.tile';
import {Tile} from './tiles/abstract.tile';

export abstract class CharacterGameObject extends GameObject implements Saveable<CharacterSave> {
  private combatLog = new Debug('combat.log');

  abstract getIsBloody(): boolean;

  public strength: number = 10;
  public endurance: number = 12;
  public dexterity: number = 10;
  public wisdom: number = 10;

  public equipment: Equipment = {};

  public states: Set<State> = new Set();

  protected isObservedByPlayer(...characters: CharacterGameObject[]): boolean {
    const player = this.context.getPlayer() as CharacterGameObject;
    return characters.some(character => character === player || player.canSeeCharacter(character));
  }

  protected logIfObserved(message: string, ...characters: CharacterGameObject[]): void {
    if (this.isObservedByPlayer(...characters)) this.context.log(message);
  }

  tick() {
    for (const state of this.states) {
      if (state.tick() === 0) {
        this.states.delete(state);
        this.logIfObserved(state.getInactiveMessage(this), this);
      } else {
        if (state.stats.damagePerTurn) {
          const hpBefore = this.getHp();
          this.damage(state.stats.damagePerTurn, state.stats.damageType);
          const event = {
            target: this.getName(),
            targetPosition: this.position,
            state: state.getName(),
            damage: hpBefore - this.getHp(),
            targetHpAfter: this.getHp(),
            turnsLeft: state.getTurnsLeft(),
          };
          this.combatLog.event('state_damage', event);
          this.context.recordEvent?.('state_damage', event);
          if (this.getHp() === 0) break;
        }
      }
    }
  }

  constructor(context: Context, public position: Position) {
    super(context);
  }

  public toSaveData(): CharacterSave {
    return {
      position: this.position,
      hp: this.hp,
      mp: this.mp,
      strength: this.strength,
      dexterity: this.dexterity,
      endurance: this.endurance,
      wisdom: this.wisdom,
      equipment: Object.fromEntries(
        Object.entries(this.equipment).map(([slot, item]) => [slot, item?.toSaveData()]),
      ),
      states: Array.from(this.states).map(state => state.toSaveData()),
    };
  }

  public getHp() {
    return Math.floor(this.hp);
  }

  damage(damage: number, type: DamageType = 'physical'): number {
    if (this.getDamageImmunities().has(type)) {
      this.logIfObserved(`${this.getName()} is immune to ${type}!`, this);
      return 0;
    }
    if (type === 'physical' && Math.random() * 10 < damage) {
      this.spreadBlood();
    }
    const hpBefore = this.hp;
    this.hp = Math.max(0, this.hp - damage);
    if (hpBefore > 0 && this.getHp() === 0) {
      if (this === (this.context.getPlayer() as CharacterGameObject)) {
        this.context.postGameMessage(GameMessage.die());
        this.context.log(`${this.getName()} is dead! Game over!`);
        this.context.log(`Press [Enter] to continue...`);
      } else {
        this.context.postGameMessage(GameMessage.kill(this));
        this.logIfObserved(`${this.getName()} is dead!`, this);
      }
    }
    return hpBefore - this.hp;
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
    const armor = this.equipment.chest?.stats?.armor ? this.equipment.chest.stats.armor : 0;
    const boots = this.equipment.boots?.stats?.armor ? this.equipment.boots.stats.armor : 0;
    const gauntlets = this.equipment.gauntlets?.stats?.armor ? this.equipment.gauntlets.stats.armor : 0;
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

  public isInvisible(): boolean {
    return Array.from(this.states).some(state => state.stats.isInvisible);
  }

  public canSeeCharacter(character: CharacterGameObject): boolean {
    if (character.isInvisible() || this.isVisible(character.position) === null) return false;
    const isPlayerSight = this === (this.context.getPlayer() as CharacterGameObject);
    const level = this.context.getCurrentGameLevel();
    if (!isPlayerSight || !level.usesFogOfWar()) return true;
    return Boolean(this.context.getCurrentMap().getTile(character.position)?.isExplored());
  }

  public noticeAttackFrom(attacker: CharacterGameObject): void { void attacker; }

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

  protected moveToPosition(position: Position, traversed: Position[] = [position]): void {
    this.position = position;
    for (const step of traversed) {
      const tile = this.context.getCurrentMap().getTile(step);
      if (tile instanceof SporePodTile) {
        this.context.getCurrentGameLevel().emitAtmosphere(step, {
          kind: 'fog', turns: 8, density: 2, shape: 'cross',
        });
        this.replaceTraversedTile(step, tile, new MoldFloorTile());
        this.logIfObserved(`${this.getName()} ruptures a spore pod! Pale fog billows out.`, this);
      } else if (tile instanceof ThornFungusTile) {
        this.replaceTraversedTile(step, tile, new MoldFloorTile());
        const poisoned = new PoisonedState(6, 1);
        if (this.applyState(poisoned)) this.logIfObserved(poisoned.getActiveMessage(this), this);
        this.logIfObserved(`${this.getName()} crushes a patch of thorn fungus.`, this);
      } else if (tile instanceof SearingGrateTile) {
        this.replaceTraversedTile(step, tile, new EmberworksFloorTile());
        const burning = new BurningState(4, 1);
        if (this.applyState(burning)) this.logIfObserved(burning.getActiveMessage(this), this);
        this.logIfObserved(`The searing grate cools beneath ${this.getName()}.`, this);
      }
    }
    if (!traversed.some(step => this.context.getCurrentMap().getTile(step) instanceof ShallowWaterTile)) return;
    if (!this.removeState(BurningState.saveId)) return;
    this.logIfObserved(`The shallow water extinguishes the flames around ${this.getName()}!`, this);
  }

  private pullToward(source: Position, maxDistance: number): number {
    const dx = source.x - this.position.x;
    const dy = source.y - this.position.y;
    if ((dx === 0) === (dy === 0)) return 0;
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    const traversed: Position[] = [];
    let destination = this.position;
    const availableDistance = Math.max(0, this.position.manhattanDistanceTo(source) - 1);
    for (let i = 0; i < Math.min(maxDistance, availableDistance); i++) {
      const next = destination.shift(stepX, stepY);
      if (!this.context.getCurrentMap().isNavigable(next) || !this.context.getIsFree(next)) break;
      traversed.push(next);
      destination = next;
    }
    if (traversed.length > 0) this.moveToPosition(destination, traversed);
    return traversed.length;
  }

  private replaceTraversedTile(position: Position, previous: Tile, replacement: Tile): void {
    replacement.setExplored(previous.isExplored());
    replacement.setBloody(previous.getIsBloody());
    this.context.getCurrentMap().setTile(position, replacement);
  }

  abstract getBaseName(): string;
  abstract getChar(frame?: AnimationFrame): Char;

  render(frame?: AnimationFrame) {
    const map = this.context.getCurrentMap();
    const tile = map.getTile(this.position);

    let stateBackgroundColor: BackgroundColor | null = null;
    let stateForegroundColor: ForegroundColor | null = null;
    let invisibilityForegroundColor: ForegroundColor | null = null;
    for (const state of this.states) {
      if (state.getBackgroundColor()) {
        stateBackgroundColor = state.getBackgroundColor();
      }
      if (state.getForegroundColor()) {
        stateForegroundColor = state.getForegroundColor();
        if (state.stats.isInvisible) invisibilityForegroundColor = state.getForegroundColor();
      }
    }

    this.context.getRenderer().put(
      new Position(this.position.x - map.getTopLeftCorner().x, this.position.y - map.getTopLeftCorner().y),
      tile.isExplored() ? {
        ...this.getChar(frame),
        backgroundColor: stateBackgroundColor ? stateBackgroundColor : tile.getChar(frame, this.position).backgroundColor,
        color: invisibilityForegroundColor ?? stateForegroundColor ?? this.getChar(frame).color,
      } : tile.getChar(frame, this.position),
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
    if (this.equipment.weapon?.usesMagicForBasicAttack) {
      return this.equipment.weapon.stats.basicDamageRoll ?? 1;
    }
    return (this.equipment.weapon && this.equipment.weapon.stats.damageRoll) ?? 4;
  }

  getDamageBonus(): number {
    if (this.equipment.weapon?.usesMagicForBasicAttack) {
      const weaponModifier = this.equipment.weapon.stats.basicDamageBonus ?? 0;
      const attributeModifier = Math.floor((this.getWisdom() - 10) / 4);
      return weaponModifier + attributeModifier;
    }
    const weaponModifier = (this.equipment.weapon && this.equipment.weapon.stats.damageBonus) ?? 0;
    const attributeModifier = this.equipment.weapon?.isRanged
      ? Math.floor((this.getDexterity() - 10) / 3)
      : Math.floor((this.getStrength() - 10) / 2);
    return attributeModifier + weaponModifier;
  }

  getMagicDiceBonus(): number {
    return (this.equipment.weapon && this.equipment.weapon.stats.magicRoll) ?? 0;
  }

  getMagicBonus(): number {
    const wisdomModifier = Math.floor((this.getWisdom() - 10) / 4);
    const weaponModifier = (this.equipment.weapon && this.equipment.weapon.stats.magicBonus) ?? 0;
    return wisdomModifier + weaponModifier;
  }

  public getLifeStealPercent(): number {
    return this.modifiers.reduce(
      (highest, modifier) => Math.max(highest, modifier.stats.lifeStealPercent ?? 0),
      0,
    );
  }

  protected getOnHitState(): State | null {
    return null;
  }

  private drainLife(
    damageDealt: number,
    additionalPercent = 0,
    target?: CharacterGameObject,
  ): number {
    const percent = Math.max(this.getLifeStealPercent(), additionalPercent);
    if (damageDealt <= 0 || percent <= 0 || this.hp >= this.getMaxHp()) return 0;
    const restored = Math.min(Math.ceil(damageDealt * percent), this.getMaxHp() - this.hp);
    this.hp += restored;
    const participants = target ? [this, target] : [this];
    this.logIfObserved(`${this.getName()} drains ${restored} health.`, ...participants);
    return restored;
  }

  public ATTACK_ROLL = 50;
  public MAX_AC = this.ATTACK_ROLL - 5;
  attack(target: CharacterGameObject): void {
    this.combatLog.log(`${this.getName()}->${target.getName()}!`);
    let projectilePath: Position[] | null = null;
    if (this.equipment.weapon?.isRanged) {
      const path = this.isVisible(target.position);
      projectilePath = path ? [...path, target.position] : null;
    }
    const ac = target.getAC();
    this.combatLog.log(`AC ${ac}`);
    const attackRoll = Math.ceil(Math.random() * this.ATTACK_ROLL);
    this.combatLog.log(`AttackRoll ${attackRoll}`);
    const verb = this.equipment.weapon?.usesMagicForBasicAttack
      ? 'zaps'
      : this.equipment.weapon?.isRanged ? 'shoots' : 'hits';
    const didHit = Boolean(attackRoll >= ac || this.modifiers.find(m => m instanceof SpectralHitMonsterModifier));
    let damageRoll: number | null = null;
    let damage = 0;
    if (didHit) {
      // hit
      const dice = this.getDamageDice();
      const bonus = this.getDamageBonus();
      damageRoll = Math.ceil(Math.random() * dice);
      this.combatLog.log(`DamageRoll ${damageRoll}`);
      damage = Math.max(damageRoll + bonus, 0);
      this.combatLog.log(`Damage ${damage}`);
      if (damage === 0) {
        this.logIfObserved(`${this.getName()} ${verb} ${target.getName()} for no damage!`, this, target);
      } else {
        const damageType = this.equipment.weapon?.stats.basicDamageType ?? 'physical';
        const damageDealt = target.damage(damage, damageType);
        if (damageDealt > 0) {
          this.logIfObserved(`${this.getName()} ${verb} ${target.getName()} for ${damageDealt} damage!`, this, target);
        }
        this.drainLife(damageDealt, 0, target);
        const onHitState = damageDealt > 0 ? this.getOnHitState() : null;
        if (onHitState && target.applyState(onHitState)) {
          this.logIfObserved(onHitState.getActiveMessage(target), this, target);
        }
      }
      if (this.equipment.weapon?.stats?.hpPerHit) {
        this.hp = Math.min(this.hp + this.equipment.weapon.stats.hpPerHit, this.getMaxHp());
      }
      if (target.equipment.chest?.stats?.mpPerHitReceived) {
        target.mp = Math.min(target.mp + target.equipment.chest.stats.mpPerHitReceived, target.getMaxMp());
      }
    }
    else {
      this.logIfObserved(`${this.getName()} ${verb} ${target.getName()} but misses!`, this, target);
    }
    if (didHit && this.isInvisible()) target.noticeAttackFrom(this);
    const combatEvent = {
      attacker: this.getName(),
      actorIsPlayer: this === (this.context.getPlayer() as CharacterGameObject),
      attackerPosition: this.position,
      target: target.getName(),
      targetPosition: target.position,
      weapon: this.equipment.weapon?.getName() ?? 'unarmed',
      ranged: Boolean(this.equipment.weapon?.isRanged),
      armorClass: ac,
      attackRoll,
      hit: didHit,
      damageRoll,
      damage,
      targetHpAfter: target.getHp(),
    };
    this.combatLog.event('weapon_attack', combatEvent);
    this.context.recordEvent?.('combat_result', {kind: 'weapon_attack', ...combatEvent});
    if (projectilePath) {
      this.context.presentProjectile?.({
        path: projectilePath,
        projectile: {
          char: '•',
          backgroundColor: BackgroundColor.Black,
          color: this.equipment.weapon?.usesMagicForBasicAttack
            ? ForegroundColor.LightGoldenrod3
            : ForegroundColor.Grey50,
        },
        impact: didHit ? 'hit' : 'miss',
      });
    }
  }

  protected modifiers: MonsterModifier[] = [];
  public getModifiers(): readonly MonsterModifier[] {
    return this.modifiers;
  }
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
    if (modifier.stats.enduranceMultiplier) {
      this.endurance = Math.ceil(this.endurance * modifier.stats.enduranceMultiplier);
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
    return super.isVisible(this.position, targetPosition, this.getVisibilityRadius(), true);
  }

  public canSeeTerrain(targetPosition: Position): boolean {
    return super.isVisible(this.position, targetPosition, this.getVisibilityRadius()) !== null;
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> {
    return new Set();
  }

  protected getStateImmunities(): ReadonlySet<string> {
    return new Set();
  }

  applyState(state: State): boolean {
    if (
      state.saveId === BurningState.saveId &&
      this.context.getCurrentMap().getTile(this.position) instanceof ShallowWaterTile
    ) {
      this.logIfObserved(`The shallow water extinguishes the flames around ${this.getName()}!`, this);
      return false;
    }
    if (this.getStateImmunities().has(state.saveId)) {
      if (state.saveId === 'burning') this.logIfObserved(`${this.getName()} cannot burn!`, this);
      else if (state.saveId === 'frozen') this.logIfObserved(`${this.getName()} cannot be frozen!`, this);
      else if (state.saveId === 'poisoned') this.logIfObserved(`${this.getName()} is immune to poison!`, this);
      else this.logIfObserved(`${this.getName()} is immune to ${state.getName()}!`, this);
      return false;
    }
    for (const existingState of this.states) {
      if (existingState.constructor === state.constructor || state.getIncompatibleStates().has(existingState.constructor as new () => State)) {
        this.states.delete(existingState);
      }
    }
    this.states.add(state);
    return true;
  }

  removeState(saveId: string): State | null {
    const state = Array.from(this.states).find(existingState => existingState.saveId === saveId);
    if (!state) return null;
    this.states.delete(state);
    return state;
  }

  applySpell(caster: CharacterGameObject, spell: Spell) {
    const spellWasObserved = this.isObservedByPlayer(caster, this);
    const logSpell = (message: string): void => {
      if (spellWasObserved) this.context.log(message);
    };
    const projectile = spell.getProjectile();
    let projectilePath: Position[] | null = null;
    if (projectile) {
      const path = caster.isVisible(this.position);
      if (path) {
        projectilePath = [...path, this.position];
      }
    }
    let impact: ProjectileImpact = 'neutral';
    if (spell.stats.state && !spell.stats.damageRoll) {
      if (!spell.stats.stateChance || Math.random() < spell.stats.stateChance) {
        const state = (spell.stats.state)();
        if (this.applyState(state)) logSpell(state.getActiveMessage(this));
      }
    }
    if (spell.stats.restoreHp) {
      if (spell.stats.restoreHp > 0) {
        logSpell(`${spell.getName()} restored ${this.getName()} ${spell.stats.restoreHp} health!`);
        this.hp = Math.min(this.getMaxHp(), this.hp + spell.stats.restoreHp);
      } else {
        logSpell(`${spell.getName()} drained ${-spell.stats.restoreHp} health from ${this.getName()}!`);
        this.damage(-spell.stats.restoreHp);
      }
    }
    if (spell.stats.removeState) {
      const removedState = this.removeState(spell.stats.removeState.saveId);
      if (removedState) {
        logSpell(removedState.getInactiveMessage(this));
      } else {
        logSpell(`${spell.getName()} had no effect on ${this.getName()}!`);
      }
    }
    if (spell.stats.atmosphere) {
      this.context.getCurrentGameLevel().emitAtmosphere(this.position, spell.stats.atmosphere);
      logSpell(`${spell.getName()} fills the area with ${spell.stats.atmosphere.kind}.`);
    }
    if (spell.stats.teleportRange) {
      const destinations: Position[] = [];
      const map = this.context.getCurrentMap();
      for (let dx = -spell.stats.teleportRange; dx <= spell.stats.teleportRange; dx++) {
        const remainingRange = spell.stats.teleportRange - Math.abs(dx);
        for (let dy = -remainingRange; dy <= remainingRange; dy++) {
          const destination = this.position.shift(dx, dy);
          const tile = map.getTile(destination);
          if (
            destination.equals(this.position) ||
            !map.isNavigable(destination) ||
            !this.context.getIsFree(destination) ||
            tile instanceof StairsDownTile ||
            tile instanceof StairsUpTile ||
            tile instanceof DeepEmberTile
          ) continue;
          destinations.push(destination);
        }
      }
      if (destinations.length > 0) {
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        this.moveToPosition(destination);
        logSpell(`${this.getName()} blinks away!`);
      } else {
        logSpell(`${spell.getName()} had no effect on ${this.getName()}!`);
      }
    }
    if (spell.stats.damageRoll && spell.stats.damageBonus) {
      this.combatLog.log(`Spell ${spell.getName()} on ${this.getName()}`);
      const ac = this.getAC();
      this.combatLog.log(`AC ${ac}`);
      const attackRoll = Math.ceil(Math.random() * this.ATTACK_ROLL);
      this.combatLog.log(`AttackRoll ${attackRoll}`);
      let damageRoll: number | null = null;
      let damage = 0;
      if (attackRoll >= ac || caster.modifiers.find(m => m instanceof SpectralHitMonsterModifier)) {
        impact = 'hit';
        const dice = spell.stats.damageRoll + caster.getMagicDiceBonus();
        const bonus = spell.stats.damageBonus + caster.getMagicBonus();
        damageRoll = Math.ceil(Math.random() * dice);
        this.combatLog.log(`DamageRoll ${damageRoll}`);
        damage = Math.max(damageRoll + bonus, 0);
        this.combatLog.log(`Damage ${damage}`);
        let damageDealt = 0;
        const damageType = spell.stats.damageType ?? 'physical';
        const damageWasImmune = damage > 0 && this.getDamageImmunities().has(damageType);
        if (damage > 0) {
          damageDealt = this.damage(damage, damageType);
          if (!damageWasImmune) logSpell(`${spell.getName()} hits ${this.getName()} for ${damage} damage!`);
          caster.drainLife(damageDealt, spell.stats.lifeStealPercent, this);
        } else {
          logSpell(`${spell.getName()} hits ${this.getName()} for no damage!`);
        }

        if (!damageWasImmune && spell.stats.state && spell.stats.stateChance) {
          if (Math.random() < spell.stats.stateChance) {
            const state = spell.stats.state();
            if (this.applyState(state)) logSpell(state.getActiveMessage(this));
          }
        }
        if (!damageWasImmune && spell.stats.pullDistance && this.getHp() > 0) {
          const distance = this.pullToward(caster.position, spell.stats.pullDistance);
          if (distance > 0) logSpell(`${this.getName()} is pulled ${distance} ${distance === 1 ? 'tile' : 'tiles'}!`);
        }
        if (caster.isInvisible()) this.noticeAttackFrom(caster);
      } else {
        impact = 'miss';
        logSpell(`${spell.getName()} misses ${this.getName()}!`);
      }
      const combatEvent = {
        caster: caster.getName(),
        actorIsPlayer: caster === (this.context.getPlayer() as CharacterGameObject),
        casterPosition: caster.position,
        target: this.getName(),
        targetPosition: this.position,
        spell: spell.getName(),
        armorClass: ac,
        attackRoll,
        hit: impact === 'hit',
        damageRoll,
        damage,
        targetHpAfter: this.getHp(),
        targetStates: Array.from(this.states).map(state => ({
          name: state.getName(),
          turnsLeft: state.getTurnsLeft(),
        })),
      };
      this.combatLog.event('spell_attack', combatEvent);
      this.context.recordEvent?.('combat_result', {kind: 'spell_attack', ...combatEvent});
    }
    if (projectile && projectilePath) {
      this.context.presentProjectile?.({path: projectilePath, projectile, impact});
    }
  }

  public spendMP(mp: number) {
    this.mp -= mp;
  }
}

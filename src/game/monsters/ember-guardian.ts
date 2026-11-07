import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {GreatAxe} from '../items/weapons/great-axe';
import {Npc} from '../npc';
import {DamageType} from '../damage';
import {BurningState} from '../states/burning.state';
import {PoisonedState} from '../states/poisoned.state';
import {Position} from '../../io/position';
import {DeepEmberTile} from '../tiles/deep-ember.tile';
import {StairsDownTile} from '../tiles/stairs-down.tile';
import {StairsUpTile} from '../tiles/stairs-up.tile';
import {FlameCinderling} from './flame-cinderling';
import {RimeCinderling} from './rime-cinderling';

export class EmberGuardian extends Npc {
  public static readonly saveId = 'ember-guardian';

  strength = 20;
  dexterity = 12;
  endurance = 24;
  wisdom = 12;
  public hp = this.getMaxHp();

  public getMaxHp(): number {
    return super.getMaxHp(3) + 32;
  }

  public getCowardice(): number {
    return 0;
  }

  protected getShout(): string {
    return 'The Ember guardian rises from the ancient cradle!';
  }

  public getChar(): Char {
    return {
      char: 'G',
      color: ForegroundColor.Gold1,
      backgroundColor: BackgroundColor.DarkRed1,
    };
  }

  public getBaseName(): string {
    return 'Ember guardian';
  }

  public getXp(): number {
    return 2500;
  }

  public getBaseLootCost(): number {
    return 0;
  }

  public equipment = {
    weapon: new GreatAxe(this.context),
  };

  public getIsBloody(): boolean {
    return false;
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> {
    return new Set(['poison']);
  }

  protected getStateImmunities(): ReadonlySet<string> {
    return new Set([BurningState.saveId, PoisonedState.saveId]);
  }

  public damage(damage: number, type: DamageType = 'physical'): number {
    const hpBefore = this.hp;
    const damageDealt = super.damage(damage, type);
    if (damageDealt === 0 || this.hp === 0) return damageDealt;

    const maxHp = this.getMaxHp();
    if (hpBefore > maxHp * 2 / 3 && this.hp <= maxHp * 2 / 3) {
      this.logIfObserved('The Guardian\'s shell splits, spilling living flame!', this);
      this.spawnWave(FlameCinderling);
    }
    if (hpBefore > maxHp / 3 && this.hp <= maxHp / 3) {
      this.logIfObserved('Cold flashes through the widening cracks. Rime cinderlings break free!', this);
      this.spawnWave(RimeCinderling);
    }
    return damageDealt;
  }

  private spawnWave(
    Constructor: new (context: typeof this.context, level: typeof this.gameLevel, position: Position) => Npc,
  ): void {
    const candidates = [
      this.position.up(),
      this.position.down(),
      this.position.left(),
      this.position.right(),
      this.position.shift(0, -2),
      this.position.shift(0, 2),
      this.position.shift(-2, 0),
      this.position.shift(2, 0),
      this.position.shift(-1, -1),
      this.position.shift(1, -1),
      this.position.shift(-1, 1),
      this.position.shift(1, 1),
    ];
    let spawned = 0;
    for (const position of candidates) {
      const tile = this.context.getCurrentMap().getTile(position);
      if (
        !tile || !tile.isNavigable() || !this.context.getIsFree(position) ||
        tile instanceof DeepEmberTile || tile instanceof StairsDownTile || tile instanceof StairsUpTile
      ) continue;
      this.gameLevel.putNpc(new Constructor(this.context, this.gameLevel, position));
      if (++spawned === 2) return;
    }
  }
}

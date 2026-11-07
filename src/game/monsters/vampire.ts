import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';
import {Spell} from '../spell';
import {LifeDrainSpell} from '../spells/life-drain';
import {DamageType} from '../damage';
import {PoisonedState} from '../states/poisoned.state';
import {InvisibilitySpell} from '../spells/invisibility';
import {InvisibilityState} from '../states/invisibility.state';
import {VeilFatigueState} from '../states/veil-fatigue.state';
import {Action} from '../npc';

export class Vampire extends Npc {
  public static readonly saveId = 'vampire';
  public strength = 12;
  public dexterity = 12;
  public endurance = 5;
  public wisdom = 10;
  public hp = this.getMaxHp();

  public getCowardice(): number { return .25; }
  public getChar(): Char {
    return {char: 'V', color: ForegroundColor.IndianRed1a, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Vampire'; }
  public getXp(): number { return 650; }
  public getBaseLootCost(): number { return 14; }
  public getIsBloody(): boolean { return true; }
  public getLifeStealPercent(): number { return Math.max(super.getLifeStealPercent(), .5); }
  protected getShout(): string { return `${this.getName()} bares its fangs!`; }

  protected getSelfSpell(): Spell | null {
    const stateIds = new Set(Array.from(this.states).map(state => state.saveId));
    if (stateIds.has(InvisibilityState.saveId) || stateIds.has(VeilFatigueState.saveId)) return null;

    const distance = this.position.manhattanDistanceTo(this.context.getPlayer().position);
    const isFleeing = this.previousAction === Action.Flee;
    if (!isFleeing && (distance < 3 || distance > 10)) return null;

    this.applyState(new VeilFatigueState(20));
    return new InvisibilitySpell();
  }

  protected getDamageImmunities(): ReadonlySet<DamageType> { return new Set(['poison']); }
  protected getStateImmunities(): ReadonlySet<string> { return new Set([PoisonedState.saveId]); }

  public getSpellLogic(): {buffs: Spell[]; attack: Spell[]} {
    return {attack: [new LifeDrainSpell()], buffs: []};
  }
}

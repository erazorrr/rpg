import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';
import {Spell, SpellTarget} from '../spell';
import {BlinkSpell} from '../spells/blink';
import {DamageType} from '../damage';
import {BurningState} from '../states/burning.state';
import {FrozenState} from '../states/frozen.state';
import {PoisonedState} from '../states/poisoned.state';

class RiftSparkSpell extends Spell {
  public static readonly saveId = 'rift-spark';
  public readonly keyBinding = 'R';

  constructor() {
    super(SpellTarget.Monster, {damageRoll: 5, damageBonus: 2}, 1);
  }

  public getName(): string { return 'Rift Spark'; }
  public getMPCost(): number { return 4; }
  public getProjectile(): Char {
    return {char: '•', color: ForegroundColor.Fuchsia, backgroundColor: BackgroundColor.Black};
  }
}

export class RiftWisp extends Npc {
  public static readonly saveId = 'rift-wisp';
  public strength = 4;
  public dexterity = 10;
  public endurance = 15;
  public wisdom = 8;

  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'o', color: ForegroundColor.Fuchsia, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Rift wisp'; }
  public getXp(): number { return 350; }
  public getBaseLootCost(): number { return 7; }
  public getIsBloody(): boolean { return false; }
  protected getShout(): string { return `${this.getName()} crackles!`; }

  protected getDamageImmunities(): ReadonlySet<DamageType> { return new Set(['poison']); }
  protected getStateImmunities(): ReadonlySet<string> {
    return new Set([BurningState.saveId, FrozenState.saveId, PoisonedState.saveId]);
  }

  protected getSelfSpell(): Spell | null {
    const player = this.context.getPlayer();
    const threatened = this.position.manhattanDistanceTo(player.position) <= 2;
    return threatened && Math.random() < .45 ? new BlinkSpell() : null;
  }

  public getSpellLogic(): {buffs: Spell[]; attack: Spell[]} {
    return {attack: [new RiftSparkSpell()], buffs: []};
  }
}

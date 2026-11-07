import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Npc} from '../npc';
import {Spell} from '../spell';
import {BlinkSpell} from '../spells/blink';
import {State} from '../state';
import {PoisonedState} from '../states/poisoned.state';

export class PhaseSpider extends Npc {
  public static readonly saveId = 'phase-spider';
  public strength = 11;
  public dexterity = 12;
  public endurance = 2;

  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'x', color: ForegroundColor.MediumPurple, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Phase spider'; }
  public getXp(): number { return 250; }
  public getBaseLootCost(): number { return 5; }
  public getIsBloody(): boolean { return true; }
  protected getShout(): string { return `${this.getName()} skitters!`; }

  protected getOnHitState(): State | null {
    return Math.random() < .25 ? new PoisonedState(10) : null;
  }

  protected getSelfSpell(): Spell | null {
    const player = this.context.getPlayer();
    const threatened = this.position.manhattanDistanceTo(player.position) <= 2;
    return threatened && Math.random() < .3 ? new BlinkSpell() : null;
  }
}

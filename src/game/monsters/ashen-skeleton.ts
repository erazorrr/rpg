import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {AtmosphereEmission} from '../atmosphere';
import {Skeleton} from './skeleton';
import {BurningState} from '../states/burning.state';

export class AshenSkeleton extends Skeleton {
  public static readonly saveId = 'ashen-skeleton';
  public endurance = 10;
  public getBaseName(): string { return 'Ashen skeleton'; }
  public getChar(): Char {
    return {char: 'S', color: ForegroundColor.Grey53, backgroundColor: BackgroundColor.Green};
  }
  public getXp(): number { return 500; }
  public getBaseLootCost(): number { return 11; }
  public getDeathAtmosphere(): AtmosphereEmission {
    return {kind: 'smoke', turns: 5, density: 2, shape: 'cross'};
  }
  protected getStateImmunities(): ReadonlySet<string> {
    return new Set([...super.getStateImmunities(), BurningState.saveId]);
  }
}

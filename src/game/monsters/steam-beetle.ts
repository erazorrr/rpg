import {Char} from '../../io/char';
import {BackgroundColor} from '../../io/background.color';
import {ForegroundColor} from '../../io/foreground.color';
import {AtmosphereEmission} from '../atmosphere';
import {Npc} from '../npc';

export class SteamBeetle extends Npc {
  public static readonly saveId = 'steam-beetle';
  public strength = 5;
  public dexterity = 12;
  public endurance = 1;
  public getCowardice(): number { return 0; }
  public getChar(): Char {
    return {char: 'b', color: ForegroundColor.LightCyan3, backgroundColor: BackgroundColor.Green};
  }
  public getBaseName(): string { return 'Steam beetle'; }
  public getXp(): number { return 80; }
  public getBaseLootCost(): number { return 2; }
  public getIsBloody(): boolean { return true; }
  public getDeathAtmosphere(): AtmosphereEmission {
    return {kind: 'steam', turns: 3, density: 2, shape: 'cross'};
  }
}

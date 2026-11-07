import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {NpcSave} from '../save-data';
import {Spell, SpellTarget} from '../spell';
import {EmberworkMechanism} from './emberwork-mechanism';

class TurretBoltSpell extends Spell {
  public static readonly saveId = 'turret-bolt';
  public readonly keyBinding = 'T';
  constructor() {
    super(SpellTarget.Monster, {damageRoll: 4, damageBonus: 2, damageType: 'arcane'}, 1);
  }
  public getName(): string { return 'Ember bolt'; }
  public getMPCost(): number { return 0; }
  public getProjectile(): Char {
    return {char: '•', color: ForegroundColor.Orange1, backgroundColor: BackgroundColor.Black};
  }
}

export class EmberTurret extends EmberworkMechanism {
  public static readonly saveId = 'ember-turret';
  public endurance = 5;
  public wisdom = 8;
  public hp = this.getMaxHp();
  private cycle = 0;

  public getChar(): Char {
    const color = this.cycle === 2 ? ForegroundColor.Orange1 : ForegroundColor.DarkGoldenrod;
    return {char: 'T', color, backgroundColor: BackgroundColor.Black};
  }
  public getBaseName(): string { return 'Ember turret'; }
  public getXp(): number { return 180; }
  public getBaseLootCost(): number { return 4; }
  public restoreCycle(cycle: number): void { this.cycle = cycle; }

  protected takeSpecialAction(): boolean {
    this.cycle = (this.cycle + 1) % 3;
    if (this.cycle === 0 && this.canSeeCharacter(this.context.getPlayer())) {
      this.context.getPlayer().applySpell(this, new TurretBoltSpell());
    }
    return true;
  }

  public toSaveData(): NpcSave {
    return {...super.toSaveData(), mechanism: {cycle: this.cycle}};
  }
}

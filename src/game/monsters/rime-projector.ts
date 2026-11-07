import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {NpcSave} from '../save-data';
import {FrozenState} from '../states/frozen.state';
import {IndestructibleEmberworkMechanism} from './emberwork-mechanism';

export class RimeProjector extends IndestructibleEmberworkMechanism {
  public static readonly saveId = 'rime-projector';
  public endurance = 20;
  public hp = this.getMaxHp();
  private cycle = 0;

  public getChar(): Char {
    const colors = [ForegroundColor.SteelBlue, ForegroundColor.SkyBlue3, ForegroundColor.LightCyan1];
    return {char: 'R', color: colors[Math.min(this.cycle, 2)], backgroundColor: BackgroundColor.NavyBlue};
  }
  public getBaseName(): string { return 'Rime projector'; }
  public getXp(): number { return 0; }
  public getBaseLootCost(): number { return 0; }
  public restoreCycle(cycle: number): void { this.cycle = cycle; }

  protected takeSpecialAction(): boolean {
    this.cycle = (this.cycle + 1) % 4;
    if (this.cycle !== 0) return true;
    const directions = [new Position(0, -1), new Position(1, 0), new Position(0, 1), new Position(-1, 0)];
    const visible = this.context.getPlayer().canSeeTerrain(this.position);
    if (visible) this.context.log('The Rime projector discharges!');
    for (const direction of directions) this.fire(direction, visible);
    return true;
  }

  private fire(direction: Position, visible: boolean): void {
    const path: Position[] = [];
    let target = null as ReturnType<typeof this.context.getCharacter>;
    for (let distance = 1; distance <= 8; distance++) {
      const position = this.position.shift(direction.x * distance, direction.y * distance);
      if (!this.context.getCurrentMap().isNavigable(position)) break;
      path.push(position);
      target = this.context.getCharacter(position);
      if (target) break;
    }
    if (target && target !== this) {
      const frozen = new FrozenState(2);
      if (target.applyState(frozen)) this.logIfObserved(frozen.getActiveMessage(target), target);
    }
    if (visible && path.length > 0) {
      this.context.presentProjectile?.({
        path,
        projectile: {char: '*', color: ForegroundColor.LightCyan1, backgroundColor: BackgroundColor.NavyBlue},
        impact: target ? 'hit' : 'neutral',
      });
    }
  }

  public toSaveData(): NpcSave {
    return {...super.toSaveData(), mechanism: {cycle: this.cycle}};
  }
}

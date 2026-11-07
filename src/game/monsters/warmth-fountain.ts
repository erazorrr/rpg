import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {IndestructibleEmberworkMechanism} from './emberwork-mechanism';

export class WarmthFountain extends IndestructibleEmberworkMechanism {
  public static readonly saveId = 'warmth-fountain';
  public endurance = 20;
  public hp = this.getMaxHp();

  public getChar(): Char {
    return {char: 'Y', color: ForegroundColor.Gold1, backgroundColor: BackgroundColor.DarkRed1};
  }
  public getBaseName(): string { return 'Warmth fountain'; }
  public getXp(): number { return 0; }
  public getBaseLootCost(): number { return 0; }

  protected takeSpecialAction(): boolean {
    const player = this.context.getPlayer();
    const characters = [player, ...this.gameLevel.getNpcs()];
    let restoredAny = false;
    for (const character of characters) {
      if (
        !character.getIsBloody() || character.getHp() <= 0 || character.getHp() >= character.getMaxHp() ||
        character.position.manhattanDistanceTo(this.position) > 3
      ) continue;
      character.hp = Math.min(character.getMaxHp(), character.hp + 1);
      restoredAny = true;
    }
    if (restoredAny && player.canSeeTerrain(this.position)) {
      this.context.log('The Warmth fountain restores nearby living flesh.');
    }
    return true;
  }
}

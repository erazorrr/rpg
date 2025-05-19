import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class PlayerStats extends GameObject implements Renderable {
  renderField(j: number, label: string, value: string): void {
    let i = 0;
    for (const char of label) {
      this.context.getRenderer().put(new Position(i, j), {
        char,
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      i++;
    }
    for (const char of value) {
      this.context.getRenderer().put(new Position(i, j), {
        char,
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      i++;
    }
  }

  render(): void {
    const player = this.context.getPlayer();
    const j = 4;

    const strengthBase = player.getStrength(false);
    const strengthTotal = player.getStrength(true);
    let strengthSuffix: string;
    if (strengthBase === strengthTotal) {
      strengthSuffix = ''
    } else if (strengthTotal > strengthBase) {
      strengthSuffix = ` + ${strengthTotal - strengthBase}`;
    } else {
      strengthSuffix = ` - ${Math.abs(strengthTotal - strengthBase)}`;
    }
    this.renderField(j + 0, 'Strength:  ', `${strengthBase}${strengthSuffix}`);
    this.renderField(j + 1, 'Dexterity: ', player.getDexterity() + '');
    this.renderField(j + 2, 'Endurance: ', player.getEndurance() + '');

    const acBase = player.getAC(false);
    const acTotal = player.getAC(true);
    let acSuffix: string;
    if (acBase === acTotal) {
      acSuffix = '';
    } else if (acTotal > acBase) {
      acSuffix = ` + ${acTotal - acBase}`;
    } else {
      acSuffix = ` - ${Math.abs(acTotal - acBase)}`;
    }
    this.renderField(j + 4, 'Armor:     ', `${acBase}${acSuffix}` + ' / ' + player.MAX_AC);
    this.renderField(j + 5, 'DmgRoll:   ', player.getDamageDice() + '');
    this.renderField(j + 6, 'DmgBonus:  ', player.getDamageBonus() + '');
  }
}

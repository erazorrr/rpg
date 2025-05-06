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

    this.renderField(j + 0, 'Strength:  ', player.getStrength() + '');
    this.renderField(j + 1, 'Dexterity: ', player.getDexterity() + '');
    this.renderField(j + 2, 'Endurance: ', player.getEndurance() + '');

    this.renderField(j + 4, 'Armor:     ', player.getAC() + ' / ' + player.MAX_AC);
    this.renderField(j + 5, 'DmgRoll:   ', player.getDamageDice() + '');
    this.renderField(j + 6, 'DmgBonus:  ', player.getDamageBonus() + '');
  }
}

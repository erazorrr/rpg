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

  private getStatefullAttribute(getter: (withStates: boolean) => number) {
    const base = getter(false);
    const total = getter(true);
    if (base === total) {
      return `${base}`;
    } else if (total > base) {
      return `${base} + ${total - base}`;
    } else {
      return `${base} - ${Math.abs(total - base)}`;
    }
  }

  render(): void {
    const player = this.context.getPlayer();
    const j = 5;

    this.renderField(j + 0, 'Strength:  ', this.getStatefullAttribute(player.getStrength.bind(player)));
    this.renderField(j + 1, 'Dexterity: ', this.getStatefullAttribute(player.getDexterity.bind(player)));
    this.renderField(j + 2, 'Endurance: ', this.getStatefullAttribute(player.getEndurance.bind(player)));
    this.renderField(j + 3, 'Wisdom:    ', this.getStatefullAttribute(player.getWisdom.bind(player)));

    this.renderField(j + 5, 'Armor:     ', this.getStatefullAttribute(player.getAC.bind(player)) + ' / ' + player.MAX_AC);
    this.renderField(j + 6, 'DmgRoll:   ', player.getDamageDice() + '');
    this.renderField(j + 7, 'DmgBonus:  ', player.getDamageBonus() + '');
    this.renderField(j + 9, 'MgcRoll:   ', player.getMagicDiceBonus() >= 0 ? `+${player.getMagicDiceBonus()}` : `-${-player.getMagicDiceBonus()}` + '');
    this.renderField(j + 10, 'MgcBonus:  ', player.getMagicBonus() + '');

    this.renderField(j + 12, 'Help:      ', '[?]');
  }
}

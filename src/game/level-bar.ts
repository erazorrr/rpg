import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";
import {getOrderRank} from './order-rank';

export class LevelBar extends GameObject implements Renderable {
    render(): void {
      let i = 0;
      const player = this.context.getPlayer();
      const label = 'LVL:       ';
      const value = `${player.level} ${getOrderRank(player.level)}`;
      for (const char of label + value) {
        this.context.getRenderer().put(new Position(i, 2), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
    }
}

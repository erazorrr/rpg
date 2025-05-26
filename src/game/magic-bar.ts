import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class MagicBar extends GameObject implements Renderable {
    render(): void {
      let i = 0;
      const label = 'MP:        ';
      for (const char of label) {
        this.context.getRenderer().put(new Position(i, 1), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
      const currentMp = Math.floor(this.context.getPlayer().mp) + '';
      for (const char of currentMp) {
        let color = ForegroundColor.Yellow;
        if (this.context.getPlayer().mp < this.context.getPlayer().getMaxMp() * 0.25) {
          color = ForegroundColor.Red;
        } else if (this.context.getPlayer().mp === this.context.getPlayer().getMaxMp()) {
          color = ForegroundColor.White;
        }
        this.context.getRenderer().put(new Position(i, 1), {
          char,
          color,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
      const rest = ' / ' + this.context.getPlayer().getMaxMp();
      for (const char of rest) {
        this.context.getRenderer().put(new Position(i, 1), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
    }
}

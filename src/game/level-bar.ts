import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class LevelBar extends GameObject implements Renderable {
    render(): void {
      let i = 0;
      const label = 'LVL:       ';
      for (const char of label) {
        this.context.getRenderer().put(new Position(i, 2), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
      const rest = this.context.getPlayer().level + '';
      for (const char of rest) {
        this.context.getRenderer().put(new Position(i, 2), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
    }
}

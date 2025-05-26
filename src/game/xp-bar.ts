import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class XpBar extends GameObject implements Renderable {
    render(): void {
      let i = 0;
      const label = 'XP:        ';
      for (const char of label) {
        this.context.getRenderer().put(new Position(i, 3), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
      const xp = this.context.getPlayer().xp + '';
      for (const char of xp) {
        this.context.getRenderer().put(new Position(i, 3), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
      const rest = ' / ' + this.context.getPlayer().nextLevelXp();
      for (const char of rest) {
        this.context.getRenderer().put(new Position(i, 3), {
          char,
          color: ForegroundColor.White,
          backgroundColor: BackgroundColor.Black,
        });
        i++;
      }
    }
}

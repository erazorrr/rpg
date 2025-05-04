import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class LevelBar extends GameObject implements Renderable {
    render(): void {
      this.context.getRenderer().put(new Position(0, 1), {
        char: 'LVL: ',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      this.context.getRenderer().put(new Position(6, 1), {
        char: this.context.getPlayer().level + '',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
    }
}

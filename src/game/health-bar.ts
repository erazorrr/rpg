import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class HealthBar extends GameObject implements Renderable {
    render(): void {
      this.context.getRenderer().put(new Position(0, 0), {
        char: 'HP: ',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      this.context.getRenderer().put(new Position(6, 0), {
        char: this.context.getPlayer().hp + '',
        color: ForegroundColor.Red,
        backgroundColor: BackgroundColor.Black,
      });
      this.context.getRenderer().put(new Position(6 + (this.context.getPlayer().hp + '').length, 0), {
        char: ' / ' + this.context.getPlayer().getMaxHp(),
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
    }
}

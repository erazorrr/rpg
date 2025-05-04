import {Renderable} from "../io/renderable.interface";
import {GameObject} from "./abstract.game-object";
import {Position} from "../io/position";
import {ForegroundColor} from "../io/foreground.color";
import {BackgroundColor} from "../io/background.color";

export class XpBar extends GameObject implements Renderable {
    render(): void {
      this.context.getRenderer().put(new Position(0, 2), {
        char: 'XP: ',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      this.context.getRenderer().put(new Position(6, 2), {
        char: this.context.getPlayer().xp + '',
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
      this.context.getRenderer().put(new Position(6 + (this.context.getPlayer().xp + '').length, 2), {
        char: ' / ' + this.context.getPlayer().nextLevelXp(),
        color: ForegroundColor.White,
        backgroundColor: BackgroundColor.Black,
      });
    }
}

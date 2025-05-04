import {Renderable} from "../io/renderable.interface";
import {Interactive} from "./interactive.interface";
import {GameObject} from "./abstract.game-object";
import {List} from "../io/list";
import {Position} from "../io/position";
import {GameMessage} from "./game-message";
import {Field} from "../io/field";
import * as process from "node:process";

export class MainMenu extends GameObject implements Renderable, Interactive {
  private field = new Field(
    'Menu',
    new Position(0, 0),
    new Position(process.stdout.columns - 1, process.stdout.rows),
  );
  private mainMenu: List = new List(
    '',
    [
      {
        id: 'new',
        label: 'New game',
        onSelect: () => {
          this.context.postGameMessage(GameMessage.newGame());
        }
      },
      {
        id: 'exit',
        label: 'Exit',
        onSelect: () => {
          this.context.postGameMessage(GameMessage.exit());
        }
      },
    ],
    new Position(10, 5),
    new Position(40, 15),
    false,
  );

  makeInteractive(): void {
    this.mainMenu.makeInteractive(this.field);
  }

  makeUninteractive(): void {
    this.mainMenu.makeUninteractive();
  }

  render(): void {
    this.field.render(this.context.getRenderer());
    this.context.getRenderer().flush();
    this.mainMenu.render(this.field);
    this.field.flush();
  }
}

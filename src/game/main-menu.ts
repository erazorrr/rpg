import {Renderable} from "../io/renderable.interface";
import {Interactive} from "./interactive.interface";
import {GameObject} from "./abstract.game-object";
import {List} from "../io/list";
import {Position} from "../io/position";
import {GameMessage} from "./game-message";
import {Field} from "../io/field";
import {Context} from "./context";
import {getCenteredBounds} from './screen-layout';

export class MainMenu extends GameObject implements Renderable, Interactive {
  private containerWidth = 41;
  private containerHeight = 16;

  constructor(context: Context, private tlPosition: Position, private brCorner: Position) {
    super(context);
  }

  public setLTPosition(position: Position): void {
    this.field.setLTPosition(position);
  }

  public setRBPosition(position: Position): void {
    this.field.setRBPosition(position);
  }

  public resize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
    this.field.setBounds(new Position(0, 0), new Position(width - 1, height - 1));
    const bounds = getCenteredBounds(width, height, 31, 10, 0);
    this.mainMenu.setBounds(bounds.topLeft, bounds.bottomRight);
  }

  private field = new Field(
    'Menu',
    this.tlPosition,
    this.brCorner,
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

  public setSaveState(valid: boolean, invalidSaveError?: string): void {
    const entries: Array<{id: string, label: string, onSelect: () => void}> = [];
    if (valid) entries.push({id: 'continue', label: 'Continue', onSelect: () => this.context.postGameMessage(GameMessage.continueGame())});
    if (invalidSaveError) {
      entries.push({
        id: 'delete-invalid',
        label: `Delete save — cannot load: ${invalidSaveError}`,
        onSelect: () => this.context.postGameMessage(GameMessage.deleteInvalidSave()),
      });
    }
    entries.push({id: 'new', label: 'New game', onSelect: () => this.context.postGameMessage(GameMessage.newGame())});
    entries.push({id: 'exit', label: 'Exit', onSelect: () => this.context.postGameMessage(GameMessage.exit())});
    this.mainMenu = new List('', entries, new Position(10, 5), new Position(40, 15), false);
    this.resize(this.containerWidth, this.containerHeight);
  }

  makeInteractive(): void {
    this.mainMenu.makeInteractive(this.field);
  }

  makeUninteractive(): void {
    this.mainMenu.makeUninteractive();
  }

  render(): void {
    this.field.render(this.context.getRenderer());
    this.mainMenu.render(this.field);
  }
}

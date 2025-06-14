import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {Context} from "./context";
import {List} from "../io/list";
import {Position} from "../io/position";
import {GameMessage} from "./game-message";
import {Interactive} from "./interactive.interface";

export class LevelUpPopup extends GameObject implements Renderable, Interactive {
  private attributesList: List;
  private pointsLeft = 5;

  private generateList(activeItemId = 'NOP') {
    this.attributesList = new List(
      `Level Up - ${this.pointsLeft} points left`,
      [
        {
          id: 'STR',
          label: `Increase strength:  ${this.context.getPlayer().strength} -> ${this.context.getPlayer().strength + 1}`,
          onSelect: () => {
            this.increaseStrength();
          },
        },
        {
          id: 'DEX',
          label: `Increase dexterity: ${this.context.getPlayer().dexterity} -> ${this.context.getPlayer().dexterity + 1}`,
          onSelect: () => {
            this.increaseDexterity();
          },
        },
        {
          id: 'END',
          label: `Increase endurance: ${this.context.getPlayer().endurance} -> ${this.context.getPlayer().endurance + 1}`,
          onSelect: () => {
            this.increaseEndurance();
          },
        },
        {
          id: 'WSD',
          label: `Increase wisdom:    ${this.context.getPlayer().wisdom} -> ${this.context.getPlayer().wisdom + 1}`,
          onSelect: () => {
            this.increaseWisdom();
          },
        },
      ],
      new Position(10, 5),
      new Position(110, 20),
      true,
      activeItemId,
    );
  }

  private commitPoint() {
    this.pointsLeft--;
    if (this.pointsLeft === 0) {
      this.context.postGameMessage(GameMessage.finishLevelUp());
    } else {
      this.makeUninteractive();
      this.generateList(this.attributesList.getActiveId());
      this.makeInteractive();
      this.render();
      this.context.getRenderer().flush(true, false);
    }
  }

  private increaseStrength() {
    this.context.getPlayer().strength++;
    this.commitPoint();
  }

  private increaseDexterity() {
    this.context.getPlayer().dexterity++;
    this.commitPoint();
  }

  private increaseEndurance() {
    this.context.getPlayer().endurance++;
    this.commitPoint();
  }

  private increaseWisdom() {
    this.context.getPlayer().wisdom++;
    this.commitPoint();
  }

  constructor(context: Context) {
    super(context);
    this.generateList();
  }

  makeInteractive(): void {
    this.attributesList.makeInteractive(this.context.getRenderer());
  }

  makeUninteractive(): void {
    this.attributesList.makeUninteractive();
  }

  render(): void {
    this.attributesList.render(this.context.getRenderer());
  }
}

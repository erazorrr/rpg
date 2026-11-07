import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {Context} from "./context";
import {List} from "../io/list";
import {Position} from "../io/position";
import {GameMessage} from "./game-message";
import {Interactive} from "./interactive.interface";
import {getCenteredBounds} from './screen-layout';

export class LevelUpPopup extends GameObject implements Renderable, Interactive {
  public static readonly ATTRIBUTE_POINTS = 3;
  private attributesList: List;
  private pointsLeft = LevelUpPopup.ATTRIBUTE_POINTS;
  private containerWidth = 111;
  private containerHeight = 21;

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
      this.resize(this.containerWidth, this.containerHeight);
      this.makeInteractive();
      this.render();
      this.context.getRenderer().flush(true);
    }
  }

  private increaseStrength() {
    this.context.recordEvent?.('level_up_point', {attribute: 'strength'});
    this.context.getPlayer().strength++;
    this.commitPoint();
  }

  private increaseDexterity() {
    this.context.recordEvent?.('level_up_point', {attribute: 'dexterity'});
    this.context.getPlayer().dexterity++;
    this.commitPoint();
  }

  private increaseEndurance() {
    this.context.recordEvent?.('level_up_point', {attribute: 'endurance'});
    this.context.getPlayer().endurance++;
    this.commitPoint();
  }

  private increaseWisdom() {
    this.context.recordEvent?.('level_up_point', {attribute: 'wisdom'});
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

  resize(containerWidth: number, containerHeight: number): void {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    const bounds = getCenteredBounds(containerWidth, containerHeight, 101, 16);
    this.attributesList.setBounds(bounds.topLeft, bounds.bottomRight);
  }

  makeUninteractive(): void {
    this.attributesList.makeUninteractive();
  }

  render(): void {
    this.attributesList.render(this.context.getRenderer());
  }
}

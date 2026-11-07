import {GameObject} from "./abstract.game-object";
import {Interactive} from "./interactive.interface";
import {Renderable} from "../io/renderable.interface";
import {Context} from "./context";
import {List} from "../io/list";
import {Npc} from "./npc";
import {GameMessage} from "./game-message";
import {Position} from "../io/position";
import {getCenteredBounds} from './screen-layout';

export class SelectTarget extends GameObject implements Interactive, Renderable {
  private list: List;

  private onSelect(npc: Npc) {
    return this.context.postGameMessage(GameMessage.selectTarget(npc));
  }

  constructor(context: Context, maxRange?: number) {
    super(context);
    const items: Array<{id: string, label: string, onSelect: () => void}> = this.context.getCurrentGameLevel().getNpcs()
      .filter(npc => (
        this.context.getPlayer().canSeeCharacter(npc) &&
        (maxRange === undefined || this.context.getPlayer().position.manhattanDistanceTo(npc.position) <= maxRange)
      ))
      .sort((npcA, npcB) => {
        const distanceA = this.context.getPlayer().position.distanceTo(npcA.position);
        const distanceB = this.context.getPlayer().position.distanceTo(npcB.position);
        return distanceA - distanceB;
      })
      .map(((npc, i) => ({
        id: i + '',
        label: `${npc.getName()} (${this.context.getPlayer().position.manhattanDistanceTo(npc.position)} tiles away)`,
        onSelect: this.onSelect.bind(this, npc),
      })));
    this.list = new List(
      'Select target',
      items,
      new Position(10, 5),
      new Position(110, 20),
      true,
      undefined,
      'No targets available.',
    );
  }

  makeInteractive(): void {
    this.list.makeInteractive(this.context.getRenderer());
  }

  resize(containerWidth: number, containerHeight: number): void {
    const bounds = getCenteredBounds(containerWidth, containerHeight, 101, 16);
    this.list.setBounds(bounds.topLeft, bounds.bottomRight);
  }

  makeUninteractive(): void {
    this.list.makeUninteractive();
  }

  render(): void {
    this.list.render(this.context.getRenderer());
  }
}

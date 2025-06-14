import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {List} from "../io/list";
import {Interactive} from "./interactive.interface";
import {Context} from "./context";
import {Item} from "./item";
import {Potion} from "./items/potions/potion";
import {Scroll} from "./abstract.scroll";

export class Inventory extends GameObject implements Renderable, Interactive {
  private list: List;

  constructor(context: Context, activeItemId: number = 0) {
    super(context);
    const items: Array<{id: string, label: string, onSelect: () => void}> = this.context.getPlayer().inventory.map((item, i) => {
      let prefix: string;
      if (item instanceof Potion || item instanceof Scroll) {
        prefix = '   ';
      } else if (Object.values(this.context.getPlayer().equipment).includes(item)) {
        prefix = '[x]';
      } else {
        prefix = '[ ]';
      }
      return {
        id: i + '',
        label: `${prefix} ${item.getName()}`,
        onSelect: () => {},
      };
    });
    this.list = new List('Inventory', items, new Position(10, 5), new Position(130, 20), true, activeItemId + '');
  }

  makeInteractive(): void {
    this.list.makeInteractive(this.context.getRenderer());
  }

  makeUninteractive(): void {
    this.list.makeUninteractive();
  }

  render(): void {
    this.list.render(this.context.getRenderer());
  }

  getSelectedItem(): Item | undefined {
    const activeId = this.list.getActiveId();
    if (activeId) {
      return this.context.getPlayer().inventory[activeId];
    }
  }
}

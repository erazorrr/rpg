import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {List} from "../io/list";
import {Context} from "./context";
import {Spell} from "./spell";
import {GameMessage} from "./game-message";
import {Position} from "../io/position";
import {Interactive} from "./interactive.interface";

export class SpellBook extends GameObject implements Renderable, Interactive {
  private list: List;

  private onSelect(spell: Spell) {
    this.context.postGameMessage(GameMessage.selectSpell(spell));
  }

  constructor(context: Context) {
    super(context);
    const items: Array<{id: string, label: string, onSelect: () => void}> = Array.from(this.context.getPlayer().knownSpells)
      .map(((spell, i) => ({
        id: i + '',
        label: spell.getName(),
        onSelect: this.onSelect.bind(this, spell),
      })));
    this.list = new List('Spellbook', items, new Position(10, 5), new Position(110, 20));
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
}

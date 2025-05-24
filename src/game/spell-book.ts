import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {List} from "../io/list";
import {Context} from "./context";
import {Spell, SpellTarget} from "./spell";
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
        label: this.getSpellDescription(spell),
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


  private getSpellDescription(spell: Spell) {
    const base = spell.getName();
    const target = spell.target === SpellTarget.Self ? ' [Self]' : ' [Monster]';
    const cost = ` [${spell.getMPCost()}MP]`;

    const stats: string[] = [];
    if (spell.stats.restoreHp) {
      if (spell.stats.restoreHp > 0) {
        stats.push(`+${spell.stats.restoreHp}HP`);
      } else {
        stats.push(`-${-spell.stats.restoreHp}HP`);
      }
    }
    if (spell.stats.damageRoll) {
      stats.push(`+${spell.stats.damageRoll}MgcRoll`);
    }
    if (spell.stats.damageBonus) {
      stats.push(`+${spell.stats.damageBonus}MgcBonus`);
    }
    if (spell.stats.state) {
      if (spell.stats.stateChance) {
        stats.push(`${Math.round(spell.stats.stateChance * 100)}%${spell.stats.state().getName()}`);
      } else {
        stats.push(`100%${spell.stats.state().getName()}`);
      }
    }

    return base + target + cost + ' (' + stats.join(' ') + ')';
  }
}

import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {List} from "../io/list";
import {Context} from "./context";
import {Spell, SpellTarget} from "./spell";
import {GameMessage} from "./game-message";
import {Position} from "../io/position";
import {Interactive} from "./interactive.interface";
import {InputEmitter} from "../io/input.emitter";
import {InputEvent} from "../io/input.event";
import {getCenteredBounds} from './screen-layout';

export class SpellBook extends GameObject implements Renderable, Interactive {
  private list: List;
  private emitter = new InputEmitter();
  private spells: Spell[];

  private onSelect(spell: Spell) {
    this.context.postGameMessage(GameMessage.selectSpell(spell));
  }

  constructor(context: Context) {
    super(context);
    this.spells = Array.from(this.context.getPlayer().knownSpells);
    const items: Array<{id: string, label: string, onSelect: () => void}> = this.spells
      .map(((spell, i) => ({
        id: i + '',
        label: this.getSpellLabel(spell),
        onSelect: this.onSelect.bind(this, spell),
      })));
    const terminalBottom = process.stdout.rows ? process.stdout.rows - 1 : 23;
    const contentBottom = items.length + 2;
    const bottom = Math.min(terminalBottom, Math.max(20, contentBottom));
    this.list = new List('Spellbook', items, new Position(10, 1), new Position(110, bottom));
  }

  makeInteractive(): void {
    this.list.makeInteractive(this.context.getRenderer());
    this.emitter.on(InputEvent.CHARACTER, this, key => {
      const spell = this.spells.find(candidate => candidate.keyBinding === key);
      if (spell) this.onSelect(spell);
    });
  }

  resize(containerWidth: number, containerHeight: number): void {
    const preferredHeight = Math.min(22, Math.max(10, this.spells.length + 2));
    const bounds = getCenteredBounds(containerWidth, containerHeight, 101, preferredHeight);
    this.list.setBounds(bounds.topLeft, bounds.bottomRight);
  }

  makeUninteractive(): void {
    this.list.makeUninteractive();
    this.emitter.clear(this);
  }

  render(): void {
    this.list.render(this.context.getRenderer());
  }

  private getSpellLabel(spell: Spell): string {
    return `[${spell.keyBinding}] ` + this.getSpellDescription(spell);
  }

  private getSpellDescription(spell: Spell) {
    const base = spell.getName();
    const target = spell.target === SpellTarget.Self
      ? ' [Self]'
      : spell.stats.range === 1 ? ' [Touch]' : ' [Monster]';
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
    if (spell.stats.removeState) {
      stats.push(`Cures ${spell.stats.removeState.name}`);
    }
    if (spell.stats.atmosphere) {
      const atmosphere = spell.stats.atmosphere;
      const kind = atmosphere.kind[0].toUpperCase() + atmosphere.kind.slice(1);
      stats.push(`${kind}Cloud`);
    }

    const details = stats.length ? ' (' + stats.join(' ') + ')' : '';
    return base + target + cost + details;
  }
}

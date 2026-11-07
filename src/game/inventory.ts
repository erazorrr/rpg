import {GameObject} from "./abstract.game-object";
import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {List} from "../io/list";
import {Interactive} from "./interactive.interface";
import {Context} from "./context";
import {Item} from "./item";
import {Potion} from "./items/potions/potion";
import {Scroll} from "./abstract.scroll";
import {Book} from "./items/books/book";
import {Equipment} from "./equipment";
import {VeyranSurveyMap} from './items/veyran-survey-map';
import {getCenteredBounds} from './screen-layout';

const equipmentSlotOrder: ReadonlyArray<keyof Equipment> = [
  'weapon',
  'chest',
  'gauntlets',
  'boots',
  'ring0',
  'ring1',
  'amulet',
];

type PotionSortKey = readonly [number, string, number];

function potionSortKey(potion: Potion): PotionSortKey {
  if (potion.stats.consumableHpReplenish) {
    return [0, 'health', potion.stats.consumableHpReplenish];
  }
  if (potion.stats.consumableMpReplenish) {
    return [1, 'mana', potion.stats.consumableMpReplenish];
  }
  if (potion.stats.consumableStateRemoval) {
    return [2, potion.stats.consumableStateRemoval.name, potion.getCost()];
  }
  if (potion.stats.consumableState) {
    return [3, potion.stats.consumableState.getName(), potion.getCost()];
  }
  return [4, potion.getBaseName(), potion.getCost()];
}

function comparePotions(a: Potion, b: Potion): number {
  const aKey = potionSortKey(a);
  const bKey = potionSortKey(b);
  return aKey[0] - bKey[0] || aKey[1].localeCompare(bKey[1]) || aKey[2] - bKey[2];
}

function potionPrefix(potion: Potion): string {
  if (potion.stats.consumableHpReplenish) return '[HP] ';
  if (potion.stats.consumableMpReplenish) return '[MP] ';
  if (potion.stats.consumableStateRemoval) return '[Cure]';
  return '[Buff]';
}

export function sortInventoryItems(items: readonly Item[], equipment: Equipment): Item[] {
  const equippedSlot = new Map<Item, number>();
  equipmentSlotOrder.forEach((slot, index) => {
    const item = equipment[slot];
    if (item) equippedSlot.set(item, index);
  });

  return items
    .map((item, index) => ({item, index}))
    .sort((a, b) => {
      const aSlot = equippedSlot.get(a.item);
      const bSlot = equippedSlot.get(b.item);
      if (aSlot !== undefined || bSlot !== undefined) {
        if (aSlot === undefined) return 1;
        if (bSlot === undefined) return -1;
        return aSlot - bSlot;
      }
      if (a.item.type !== b.item.type) {
        return a.item.type - b.item.type;
      }
      if (a.item instanceof Potion && b.item instanceof Potion) {
        return comparePotions(a.item, b.item) || a.index - b.index;
      }
      const aName = a.item.getName().toLocaleLowerCase();
      const bName = b.item.getName().toLocaleLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return a.index - b.index;
    })
    .map(({item}) => item);
}

export class Inventory extends GameObject implements Renderable, Interactive {
  private list: List;
  private readonly items: Item[];

  constructor(context: Context, activeItem?: Item, fallbackActiveIndex: number = 0) {
    super(context);
    const player = this.context.getPlayer();
    this.items = sortInventoryItems(player.inventory, player.equipment);
    const activeItemIndex = activeItem ? this.items.indexOf(activeItem) : -1;
    const lastItemIndex = Math.max(0, this.items.length - 1);
    const activeIndex = activeItemIndex === -1
      ? Math.min(Math.max(fallbackActiveIndex, 0), lastItemIndex)
      : activeItemIndex;
    const items: Array<{id: string, label: string, onSelect: () => void}> = this.items.map((item, i) => {
      let prefix: string;
      if (item instanceof Potion) {
        prefix = potionPrefix(item);
      } else if (item instanceof Scroll || item instanceof Book || item instanceof VeyranSurveyMap) {
        prefix = '   ';
      } else if (Object.values(player.equipment).includes(item)) {
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
    this.list = new List('Inventory', items, new Position(10, 5), new Position(130, 20), true, activeIndex + '');
  }

  makeInteractive(): void {
    this.list.makeInteractive(this.context.getRenderer());
  }

  resize(containerWidth: number, containerHeight: number): void {
    const preferredHeight = Math.min(16, Math.max(5, this.items.length + 2));
    const bounds = getCenteredBounds(containerWidth, containerHeight, 121, preferredHeight);
    this.list.setBounds(bounds.topLeft, bounds.bottomRight);
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
      return this.items[Number(activeId)];
    }
  }

  getSelectedIndex(): number {
    const activeId = this.list.getActiveId();
    return activeId === undefined ? 0 : Number(activeId);
  }
}

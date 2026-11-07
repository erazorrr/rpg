jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Context} from "./context";
import {Inventory, sortInventoryItems} from "./inventory";
import {Item} from "./item";
import {LightGoesFirstBook} from "./items/books/light-goes-first";
import {LeatherArmor} from "./items/chest/leather-armor";
import {HealthPotion} from "./items/potions/health";
import {SmallHealthPotion} from './items/potions/small-health';
import {ManaPotion} from './items/potions/mana';
import {ThawPotion} from './items/potions/thaw';
import {StrengthPotion} from './items/potions/strength';
import {ChampionStrengthPotion} from './items/potions/champion-strength';
import {FireBoltScroll} from "./items/scrolls/fire-bolt.scroll";
import {Bow} from "./items/weapons/bow";
import {ShortSword} from "./items/weapons/short-sword";

describe('Inventory', () => {
  const context = {} as Context;

  it('sorts equipped gear first, followed by grouped inventory items', () => {
    const book = new LightGoesFirstBook(context);
    const potion = new HealthPotion(context);
    const bow = new Bow(context);
    const armor = new LeatherArmor(context);
    const sword = new ShortSword(context);
    const scroll = new FireBoltScroll(context);
    const items = [book, potion, bow, armor, sword, scroll];

    const sorted = sortInventoryItems(items, {weapon: sword, chest: armor});

    expect(sorted).toEqual([sword, armor, bow, potion, scroll, book]);
    expect(items).toEqual([book, potion, bow, armor, sword, scroll]);
  });

  it('keeps the selected item after sorting and falls back to the nearest row when it is gone', () => {
    const book = new LightGoesFirstBook(context);
    const potion = new HealthPotion(context);
    const bow = new Bow(context);
    const sword = new ShortSword(context);
    const player = {
      inventory: [book, potion, bow, sword] as Item[],
      equipment: {weapon: sword},
    };
    const inventoryContext = {
      getPlayer: () => player,
    } as Context;

    const selectedInventory = new Inventory(inventoryContext, book);
    expect(selectedInventory.getSelectedItem()).toBe(book);

    player.inventory = [potion, bow, sword];
    const fallbackInventory = new Inventory(inventoryContext, book, selectedInventory.getSelectedIndex());
    expect(fallbackInventory.getSelectedItem()).toBe(potion);
  });

  it('groups potions by purpose and strength instead of alphabetically', () => {
    const championStrength = new ChampionStrengthPotion(context);
    const mana = new ManaPotion(context);
    const health = new HealthPotion(context);
    const thaw = new ThawPotion(context);
    const strength = new StrengthPotion(context);
    const smallHealth = new SmallHealthPotion(context);

    const sorted = sortInventoryItems(
      [championStrength, mana, health, thaw, strength, smallHealth],
      {},
    );

    expect(sorted).toEqual([smallHealth, health, mana, thaw, strength, championStrength]);
  });
});

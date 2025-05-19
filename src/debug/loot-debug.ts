import {LootGenerator} from "../game/loot-generator";
import {Context} from "../game/context";

const COST = +process.argv[2];

const lootGenerator = new LootGenerator({} as Context);
const items = lootGenerator['loot'];
const MIN_COST = Math.max(1, Math.round(COST * 0.2));

// assuming we have every cost
const result: Record<string, number> = {};
for (let i = MIN_COST; i <= COST; i++) {
  const p1 = 1 / (COST - MIN_COST);
  for (const item of items[i]) {
    const p2 = 1 / items[i].length;
    if (!result[item.getName()]) {
      result[item.getName()] = 0;
    }
    result[item.getName()] += p1 * p2;
  }
}

Object.entries(result)
  .sort(([, p1], [, p2]) => p2 - p1)
  .forEach(([key, value]) => {
    console.log(`${key}: ${value * 100}%`);
  })

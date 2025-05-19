import {LootGenerator} from "../game/loot-generator";

const COST = +process.argv[2];

Object.entries(LootGenerator.getLoot(COST))
  .sort(([, p1], [, p2]) => p2 - p1)
  .forEach(([key, value]) => {
    console.log(`${key}: ${value * 100}%`);
  })

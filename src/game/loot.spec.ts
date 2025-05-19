import {Context} from "./context";
import {Goblin} from "./monsters/goblin";
import {Level} from "./level";
import {Position} from "../io/position";
import {LootGenerator} from "./loot-generator";
import {Ogre} from "./monsters/ogre";
import {Skeleton} from "./monsters/skeleton";
import {Wolf} from "./monsters/wolf";
import {StrengthMonsterModifier} from "./monster-modufiers/strength";

describe('Loot check', () => {
  const ctx = {} as Context;
  const level = {} as Level;
  const position = new Position(0, 0);

  describe('Health potion', () => {
    const monsters = [
      new Goblin(ctx, level, position),
      new Goblin(ctx, level, position).applyModifier(new StrengthMonsterModifier()),
      new Wolf(ctx, level, position),
      new Wolf(ctx, level, position).applyModifier(new StrengthMonsterModifier()),
      new Ogre(ctx, level, position),
      new Skeleton(ctx, level, position),
    ];
    for (const monster of monsters) {
      describe(monster.getName(), () => {
        it('should have more than 20% and less than 30% chance of getting health potion', () => {
          const loot = LootGenerator.getLoot(monster.getLootCost());
          let log = '';
          const healthProbability = Object.entries(loot).reduce((acc, [name, p]) => {
            if (/health potion/i.test(name)) {
              log += `Probability of dropping ${name} from ${monster.getName()}: ${p * 100}%\n`;
              return acc + p;
            }
            return acc;
          }, 0);
          console.log(log);
          expect(healthProbability).toBeGreaterThan(0.2);
          expect(healthProbability).toBeLessThan(0.3);
        });
      });
    }
  });

  describe('Strength potion', () => {
    const monsters = [
      new Goblin(ctx, level, position),
      new Goblin(ctx, level, position).applyModifier(new StrengthMonsterModifier()),
      new Wolf(ctx, level, position),
      new Wolf(ctx, level, position).applyModifier(new StrengthMonsterModifier()),
      new Ogre(ctx, level, position),
      new Skeleton(ctx, level, position),
    ];
    for (const monster of monsters) {
      describe(monster.getName(), () => {
        it('should have more than 5% and less than 10% chance of getting health potion', () => {
          const loot = LootGenerator.getLoot(monster.getLootCost());
          let log = '';
          const probability = Object.entries(loot).reduce((acc, [name, p]) => {
            if (/strength potion/i.test(name)) {
              log += `Probability of dropping ${name} from ${monster.getName()}: ${p * 100}%\n`;
              return acc + p;
            }
            return acc;
          }, 0);
          console.log(log);
          expect(probability).toBeGreaterThan(0.05);
          expect(probability).toBeLessThan(0.1);
        });
      });
    }
  })
});

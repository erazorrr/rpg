import {GameObject} from "./abstract.game-object";
import {Level} from "./level";
import {GameMap} from "./game.map";
import {Position, SerializedPosition} from "../io/position";
import {Tile} from "./tiles/abstract.tile";
import {Context} from "./context";
import {Goblin} from "./monsters/goblin";
import {Wolf} from "./monsters/wolf";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {Debug} from "../debug";
import {
  DungeonDraft,
  Random,
  generateDungeonLayout,
  generateGuaranteedDungeonLayout,
} from './dungeon-generation/dungeon-layout';
import {applyDungeonBiomes, assignDungeonBiomes} from './dungeon-generation/dungeon-biomes';
import {addTreasureRooms, decorateDungeon} from './dungeon-generation/dungeon-structures';
import {
  countNavigableTiles,
  MIN_DUNGEON_NAVIGABLE_TILES,
  validateDungeonTerrain,
} from './dungeon-generation/dungeon-validation';
import {populateDungeon} from './dungeon-generation/dungeon-population';
import {DeepEmberTile} from './tiles/deep-ember.tile';
import {addRareUndergroundLake} from './dungeon-generation/dungeon-lakes';
import {EmberGuardian} from './monsters/ember-guardian';
import {StatueInscriptionId} from './tiles/statue-inscriptions';
import {LootGenerator} from './loot-generator';
import {LootChestRarity, LootChestTile} from './tiles/loot-chest.tile';
import {addRareDungeonPattern} from './dungeon-generation/dungeon-patterns';
import {addBiomeInteractions} from './dungeon-generation/dungeon-interactions';
import {generateSurfaceDraft, selectSurfaceNpcPositions} from './surface-generation';

type LevelTemplate = {
  level: Level;
  freeTiles: Position[];
  surfaceRoad?: ReadonlySet<SerializedPosition>;
}

const ORGANIC_DUNGEON_LAYOUT_ATTEMPTS = 4;
const PREFERRED_DUNGEON_NAVIGABLE_TILES = MIN_DUNGEON_NAVIGABLE_TILES + 256;
const MIN_USABLE_DUNGEON_NAVIGABLE_TILES = 2000;

export class LevelGenerator extends GameObject {
  private debug: Debug = new Debug('level-generator.log');
  private lootGenerator: LootGenerator;

  constructor(context: Context, private containerWidth: number, private containerHeight: number, private readonly random: Random = Math.random) {
    super(context);
    this.lootGenerator = new LootGenerator(context);
  }

  public setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  private generateSurfaceAreaNpcs(template: LevelTemplate) {
    this.debug.log(`generateSurfaceAreaNpcs start...`);
    const startingPosition = template.level.map.getInitialPosition();
    const entrancePosition = template.level.findTile(StairsDownTile);
    if (!template.surfaceRoad) throw new Error('Surface road is missing from its level template');
    const positions = selectSurfaceNpcPositions(
      template.freeTiles,
      startingPosition,
      entrancePosition,
      template.surfaceRoad,
      this.random,
    );
    const initialMonster = new Goblin(this.context, template.level, positions[0]);
    initialMonster.hp = initialMonster.getMaxHp();
    template.level.putNpc(initialMonster);

    for (let i = 0; i < 10; i++) {
      const position = positions[i + 1];
      const Monster = this.random() < .5 ? Goblin : Wolf;
      const monster = new Monster(this.context, template.level, position);
      monster.hp = monster.getMaxHp();
      template.level.putNpc(monster);
    }
    this.debug.log(`generateSurfaceAreaNpcs done!`);
  }

  public generateLevel(
    i: number,
    previousLevel?: Level,
    usedStatueInscriptions: ReadonlySet<StatueInscriptionId> = new Set(),
  ): Level {
    this.debug.log(`generateLevel for ${i}...`);
    let template: LevelTemplate;
    if (i === 0) {
      let path: Position[];
      do {
        template = this.generateSurfaceLevel();
        path = this.context.buildPath(template.level.map.getInitialPosition(), template.level.findTile(StairsDownTile), 1000, template.level.map);
      } while (path.length === 0);
      this.generateSurfaceAreaNpcs(template);
    } else {
      template = this.generateDungeonLevel(i, previousLevel, usedStatueInscriptions);
    }
    this.debug.log(`generateLevel for ${i} done!`);
    return template.level;
  }

  private generateDungeonLevel(
    i: number,
    previousLevel: Level,
    usedStatueInscriptions: ReadonlySet<StatueInscriptionId>,
  ): LevelTemplate {
    this.debug.log(`generateDungeonLevel for ${i}...`);
    const width = 200;
    const height = 200;

    const stairsPosition: Position = previousLevel.findTile(StairsDownTile);
    if (!stairsPosition) {
      throw new Error(`No stairs down found during ${i} generation`);
    }
    let layout = this.generateBestOrganicDungeonLayout(width, height, stairsPosition, i);
    if (!layout || countNavigableTiles(layout) < MIN_USABLE_DUNGEON_NAVIGABLE_TILES) {
      this.debug.log(`Using emergency fallback layout for dungeon ${i}`);
      layout = generateGuaranteedDungeonLayout(
        width,
        height,
        stairsPosition,
        PREFERRED_DUNGEON_NAVIGABLE_TILES,
      );
    }
    const draft = this.prepareDungeonDraft(layout, i);
    addRareUndergroundLake(draft, this.random);
    if (addTreasureRooms(draft, this.random, () => this.createLootChest(i)) !== 2) {
      throw new Error(`Guaranteed dungeon level ${i} does not contain two treasure rooms`);
    }
    addRareDungeonPattern(draft, this.random);
    decorateDungeon(draft, i, this.random, usedStatueInscriptions);
    addBiomeInteractions(draft, this.random);
    validateDungeonTerrain(draft);
    const navigableTiles = countNavigableTiles(draft);
    if (navigableTiles < MIN_DUNGEON_NAVIGABLE_TILES) {
      this.debug.log(
        `Dungeon ${i} has ${navigableTiles} navigable tiles, below the preferred ${MIN_DUNGEON_NAVIGABLE_TILES}`,
      );
    }
    const tiles = draft.tiles as Tile[][];
    const map = new GameMap(this.context, tiles, stairsPosition, width, height, this.containerWidth, this.containerHeight);
    const level = new Level(i, map);
    if (i === 3) {
      map.setTile(draft.downstairs, new DeepEmberTile());
      const guardianPosition = [
        draft.downstairs.up(),
        draft.downstairs.down(),
        draft.downstairs.left(),
        draft.downstairs.right(),
      ].find(position => map.isNavigable(position));
      if (!guardianPosition) throw new Error('Guaranteed finale has no position for the Ember Guardian');
      level.putNpc(new EmberGuardian(this.context, level, guardianPosition));
    }
    populateDungeon(this.context, level, draft, i, this.random);
    this.debug.log(`generateDungeonLevel for ${i} done!`);
    return {level, freeTiles: []};
  }

  private generateBestOrganicDungeonLayout(
    width: number,
    height: number,
    upstairs: Position,
    depth: number,
  ): DungeonDraft | null {
    let best: DungeonDraft | null = null;
    let bestNavigableTiles = -1;
    for (let attempt = 0; attempt < ORGANIC_DUNGEON_LAYOUT_ATTEMPTS; attempt++) {
      let candidate: DungeonDraft;
      try {
        candidate = generateDungeonLayout(width, height, upstairs, this.random);
      } catch (error) {
        this.debug.log(
          `Organic dungeon ${depth} layout ${attempt + 1} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }
      if (this.countTreasureRoomCandidates(candidate) < 2) continue;
      const navigableTiles = countNavigableTiles(candidate);
      if (navigableTiles > bestNavigableTiles) {
        best = candidate;
        bestNavigableTiles = navigableTiles;
      }
      if (navigableTiles >= PREFERRED_DUNGEON_NAVIGABLE_TILES) break;
    }
    return best;
  }

  private prepareDungeonDraft(draft: DungeonDraft, depth: number): DungeonDraft {
    assignDungeonBiomes(draft, depth, this.random);
    applyDungeonBiomes(draft, this.random);
    return draft;
  }

  private countTreasureRoomCandidates(draft: DungeonDraft): number {
    return draft.regions.filter(region =>
      region.kind === 'room' &&
      region.id !== 0 &&
      region.floor.length >= 35 &&
      !region.floor.some(position => position.equals(draft.upstairs) || position.equals(draft.downstairs)) &&
      region.floor.some(position =>
        draft.tiles[position.x]?.[position.y]?.isNavigable() && !draft.reserved.has(position.serialize()),
      ),
    ).length;
  }

  private createLootChest(depth: number): LootChestTile {
    const roll = this.random();
    const rarity: LootChestRarity = roll < .65 ? 'sturdy' : roll < .95 ? 'reinforced' : 'gilded';
    const budget = 14 + 10 * (depth - 1);
    const rolls: Array<{cost: number; preferPotions: boolean}> = rarity === 'sturdy'
      ? [{cost: budget, preferPotions: true}, {cost: budget, preferPotions: true}]
      : rarity === 'reinforced'
        ? [{cost: budget, preferPotions: true}, {cost: Math.round(budget * 1.25), preferPotions: true}]
        : [
          {cost: budget, preferPotions: true},
          {cost: budget, preferPotions: true},
          {cost: Math.round(budget * 1.5), preferPotions: false},
        ];
    const items = rolls.flatMap(chestRoll => {
      const item = this.lootGenerator.generateChestLoot(chestRoll.cost, chestRoll.preferPotions, depth);
      return item ? [item] : [];
    });
    return new LootChestTile(rarity, items);
  }

  private generateSurfaceLevel(): LevelTemplate {
    this.debug.log(`generateSurfaceLevel...`);
    const draft = generateSurfaceDraft(this.random);
    const map = new GameMap(
      this.context,
      draft.tiles,
      draft.initialPosition,
      draft.tiles.length,
      draft.tiles[0].length,
      this.containerWidth,
      this.containerHeight,
    );

    this.debug.log(`generateSurfaceLevel done!`);
    return {level: new Level(0, map), freeTiles: draft.freeTiles, surfaceRoad: draft.road};
  }
}

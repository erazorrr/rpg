import {GameObject} from "./abstract.game-object";
import {Level} from "./level";
import {GameMap} from "./game.map";
import {TreeTile} from "./tiles/tree.tile";
import {GrassTile} from "./tiles/grass.tile";
import {Position, SerializedPosition} from "../io/position";
import {WaterTile} from "./tiles/water.tile";
import {Tile} from "./tiles/abstract.tile";
import {ShallowWaterTile} from "./tiles/shallow-water.tile";
import {Context} from "./context";
import {Goblin} from "./monsters/goblin";
import {Wolf} from "./monsters/wolf";
import {Ogre} from "./monsters/ogre";
import {Skeleton} from "./monsters/skeleton";
import {StrengthMonsterModifier} from "./monster-modifiers/strength";
import {DexterityMonsterModifier} from "./monster-modifiers/dexterity";
import {EnduranceMonsterModifier} from "./monster-modifiers/endurance";
import {SpectralHitMonsterModifier} from "./monster-modifiers/spectral-hit";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {StairsUpTile} from "./tiles/stairs-up.tile";
import {FloorTile} from "./tiles/floor.tile";
import {WallTile} from "./tiles/wall.tile";
import {TreasureGoblin} from "./monsters/treasure-goblin";
import {Debug} from "../debug";
import {TorchTile} from "./tiles/torch.tile";
import {GoblinHunter} from "./monsters/goblin-hunter";
import {SkeletonArcher} from "./monsters/skeleton-archer";
import {GoblinMage} from "./monsters/goblin-mage";
import {OgreMage} from "./monsters/ogre-mage";
import {SkeletonMage} from "./monsters/skeleton-mage";
import {WisdomMonsterModifier} from "./monster-modifiers/wisdom";

enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

type LevelTemplate = {
  level: Level;
  freeTiles: Position[];
}

export class LevelGenerator extends GameObject {
  private debug: Debug = new Debug('level-generator.log');

  constructor(context: Context, private containerWidth: number, private containerHeight: number) {
    super(context);
  }

  public setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  private startingAreaSize = 50;
  private generateSurfaceAreaNpcs(template: LevelTemplate) {
    this.debug.log(`generateSurfaceAreaNpcs start...`);
    const startingPosition = template.level.map.getInitialPosition();
    let position: Position;
    do {
      let x;
      if (Math.random() < 0.5) {
        x = startingPosition.x + Math.floor(Math.random() * this.startingAreaSize);
      } else {
        x = startingPosition.x - Math.floor(Math.random() * this.startingAreaSize);
      }
      let y;
      if (Math.random() < 0.5) {
        y = startingPosition.y + Math.floor(Math.random() * this.startingAreaSize);
      } else {
        y = startingPosition.y - Math.floor(Math.random() * this.startingAreaSize);
      }
      position = new Position(x, y);
    } while (!template.level.map.isNavigable(position) || template.level.getNpcAt(position) || template.level.map.getInitialPosition().equals(position));

    const initialMonster = new Goblin(this.context, template.level, position);
    template.level.putNpc(initialMonster);

    for (let i = 0; i < 10; i++) {
      do {
        let x;
        if (Math.random() < 0.5) {
          x = startingPosition.x + this.startingAreaSize + Math.floor(Math.random() * (template.level.map.width - this.startingAreaSize * 2 - startingPosition.x));
        } else {
          x = startingPosition.x - this.startingAreaSize - Math.floor(Math.random() * (startingPosition.x - this.startingAreaSize));
        }
        let y;
        if (Math.random() < 0.5) {
          y = startingPosition.y + this.startingAreaSize + Math.floor(Math.random() * (template.level.map.height - this.startingAreaSize * 2 - startingPosition.y));
        } else {
          y = startingPosition.y - this.startingAreaSize - Math.floor(Math.random() * (startingPosition.y - this.startingAreaSize));
        }
        position = new Position(x, y);
      } while (!template.level.map.isNavigable(position) || template.level.getNpcAt(position) || template.level.map.getInitialPosition().equals(position));
      const monster = Math.random() < 0.5 ? new Goblin(this.context, template.level, position) : new Wolf(this.context, template.level, position);
      template.level.putNpc(monster);
    }
    this.debug.log(`generateSurfaceAreaNpcs done!`);
  }

  private npcs = [
    [[], []],
    [[[Goblin, 90], [GoblinHunter, 10], [GoblinMage, 10]], [EnduranceMonsterModifier]],
    [[[Ogre, 20], [Goblin, 30], [GoblinHunter, 20], [OgreMage, 10], [GoblinMage, 20]], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier, WisdomMonsterModifier]],
    [[[Ogre, 20], [Skeleton, 15], [GoblinHunter, 20], [SkeletonArcher, 10], [OgreMage, 10], [SkeletonMage, 5], [GoblinMage, 20]], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier, SpectralHitMonsterModifier, WisdomMonsterModifier]],
  ] as const;
  private generateNpcs(template: LevelTemplate) {
    this.debug.log(`generateNpcs for ${template.level.levelNo}...`);
    if (template.level.levelNo === 0) {
      this.generateSurfaceAreaNpcs(template);
      return;
    }

    const npcCount = 300;
    const [npcs, _modifiers] = this.npcs[template.level.levelNo];
    for (let i = 0; i < npcCount; i++) {
      let position: Position;
      let freePositionIdx: number;
      do {
        freePositionIdx = Math.floor(Math.random() * template.freeTiles.length);
        position = template.freeTiles[freePositionIdx];
      } while (template.level.getNpcAt(position));
      template.freeTiles.splice(freePositionIdx, 1);
      let npcRoll = Math.floor(Math.random() * 100);
      let npcIndex = 0;
      while (npcRoll - npcs[npcIndex][1] > 0) {
        npcRoll -= npcs[npcIndex][1];
        npcIndex++;
      }
      const npc = new npcs[npcIndex][0](this.context, template.level, position);
      const modifiersRoll = Math.floor(Math.random() * 100);
      let modifiersCount;
      if (modifiersRoll < 45) {
        modifiersCount = 0;
      } else if (modifiersRoll < 70) {
        modifiersCount = 1;
      } else if (modifiersRoll < 90) {
        modifiersCount = 2;
      } else {
        modifiersCount = 3;
      }
      const modifiers = [..._modifiers];
      for (let i = 0; i < modifiersCount; i++) {
        if (modifiers.length === 0) {
          break;
        }
        const idx = Math.floor(Math.random() * modifiers.length);
        const modifier = new (modifiers.splice(idx, 1)[0])();
        npc.applyModifier(modifier);
      }
      template.level.putNpc(npc);
    }
    for (let i = 0; i < 4; i++) {
      let position: Position;
      let freePositionIdx: number;
      do {
        freePositionIdx = Math.floor(Math.random() * template.freeTiles.length);
        position = template.freeTiles[freePositionIdx];
      } while (template.level.getNpcAt(position));
      const treasureGoblin = new TreasureGoblin(this.context, template.level, position, 14 + 10 * (template.level.levelNo - 1));
      template.level.putNpc(treasureGoblin);
    }
    this.debug.log(`generateNpcs for ${template.level.levelNo} done!`);
  }

  public generateLevel(i: number, previousLevel?: Level): Level {
    this.debug.log(`generateLevel for ${i}...`);
    let template: LevelTemplate;
    if (i === 0) {
      let path: Position[];
      do {
        template = this.generateSurfaceLevel();
        path = this.context.buildPath(template.level.map.getInitialPosition(), template.level.findTile(StairsDownTile), 1000, template.level.map);
      } while (path.length === 0);
    } else {
      template = this.generateDungeonLevel(i, previousLevel);
    }
    this.generateNpcs(template);
    this.debug.log(`generateLevel for ${i} done!`);
    return template.level;
  }

  private generateDungeonLevel(i: number, previousLevel: Level): LevelTemplate {
    this.debug.log(`generateDungeonLevel for ${i}...`);
    const width = 200;
    const height = 200;

    const stairsPosition: Position = previousLevel.findTile(StairsDownTile);
    if (!stairsPosition) {
      throw new Error(`No stairs down found during ${i} generation`);
    }
    const initialPosition = stairsPosition;
    const tiles: Tile[][] = [];
    for (let i = 0; i < width; i++) {
      tiles[i] = [];
      for (let j = 0; j < height; j++) {
        tiles[i].push(undefined);
      }
    }

    tiles[initialPosition.x][initialPosition.y] = new StairsUpTile();

    const freeTiles: Position[] = [];

    let doors: Array<{position: Position, direction: Direction}>;
    for (const direction of [Direction.Up, Direction.Down, Direction.Left, Direction.Right]) {
      const initialRoom = this.generateRoom(tiles, initialPosition, direction, 1000);
      if (initialRoom) {
        doors = initialRoom.doors;
        freeTiles.push(...initialRoom.freeTiles);
        break;
      }
    }
    if (!doors) {
      throw new Error(`Cannot create initial room at ${i}`);
    }

    let lastDoor: Position;
    while (doors.length > 0) {
      const {position, direction} = doors.shift();
      const room = this.generateRoom(tiles, position, direction);
      if (!room) {
        if (doors.length === 0 && !lastDoor) {
          // turning the door into a stairs
          tiles[position.x][position.y] = new StairsDownTile();
          lastDoor = position;
        } else {
          // removing the door
          tiles[position.x][position.y] = undefined;
        }
      } else {
        doors.push(...room.doors);
        freeTiles.push(...room.freeTiles);
      }
    }

    while (!lastDoor) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (tiles[x][y] instanceof FloorTile && new Position(x, y).manhattanDistanceTo(initialPosition) > 200) {
        tiles[x][y] = new StairsDownTile();
        lastDoor = new Position(x, y);
      }
    }

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (!tiles[i][j]) {
          tiles[i][j] = new WallTile();
        }
      }
    }

    const map = new GameMap(this.context, tiles, initialPosition, width, height, this.containerWidth, this.containerHeight);
    this.debug.log(`generateDungeonLevel for ${i} done!`);
    return {level: new Level(i, map), freeTiles};
  }

  private checkIfRoomIsPossible(tiles: Tile[][], topLeftCorner: Position, bottomRightCorner: Position): boolean {
    if (topLeftCorner.x < 0 || topLeftCorner.y < 0 || bottomRightCorner.x >= tiles.length || bottomRightCorner.y >= tiles[0].length) {
      return false;
    }

    for (let i = topLeftCorner.x; i <= bottomRightCorner.x; i++) {
      for (let j = topLeftCorner.y; j <= bottomRightCorner.y; j++) {
        if (tiles[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  private generateRoom(tiles: Tile[][], entrance: Position, direction: Direction, tries = 50): {doors: Array<{position: Position, direction: Direction}>, freeTiles: Position[]} | null {
    this.debug.log(`generateRoom from ${entrance.serialize()}, direction: ${direction}...`);
    let triesLeft = tries;
    let width: number;
    let height: number;
    let topLeftCorner: Position;
    let bottomRightCorner: Position;
    this.debug.log(`Picking sizes...`);
    do {
      if (triesLeft-- === 0) {
        this.debug.log(`Failed to generate room!`);
        return null;
      }
      if (Math.random() < 0.2) {
        if (direction === Direction.Up || direction === Direction.Down) {
          width = 1;
          height = Math.floor(Math.random() * 5) + 5;
        } else if (direction === Direction.Left || direction === Direction.Right) {
          width = Math.floor(Math.random() * 5) + 5;
          height = 1;
        }
      } else {
        width = Math.floor(Math.random() * 15) + 5;
        height = Math.floor(Math.random() * 10) + 5;
      }
      switch (direction) {
        case Direction.Up: {
          const dx = Math.floor(Math.random() * width);
          topLeftCorner = new Position(entrance.x - width + dx, entrance.y - height);
          bottomRightCorner = new Position(entrance.x + dx, entrance.y - 1);
          break;
        }
        case Direction.Down: {
          const dx = Math.floor(Math.random() * width);
          topLeftCorner = new Position(entrance.x - width + dx, entrance.y + 1);
          bottomRightCorner = new Position(entrance.x + dx, entrance.y + height);
          break;
        }
        case Direction.Left: {
          const dy = Math.floor(Math.random() * height);
          topLeftCorner = new Position(entrance.x - width, entrance.y - height + dy);
          bottomRightCorner = new Position(entrance.x - 1, entrance.y + dy);
          break;
        }
        case Direction.Right: {
          const dy = Math.floor(Math.random() * height);
          topLeftCorner = new Position(entrance.x + 1, entrance.y - height + dy);
          bottomRightCorner = new Position(entrance.x + width, entrance.y + dy);
          break;
        }
      }
    } while (!this.checkIfRoomIsPossible(tiles, topLeftCorner, bottomRightCorner));

    this.debug.log(`Sizing is ok: ${topLeftCorner.serialize()}, ${bottomRightCorner.serialize()}`);

    const freeTiles: Position[] = [];
    for (let i = topLeftCorner.x; i <= bottomRightCorner.x; i++) {
      for (let j = topLeftCorner.y; j <= bottomRightCorner.y; j++) {
        tiles[i][j] = new FloorTile();
        freeTiles.push(new Position(i, j));
      }
    }

    const margin = 8;
    const canGenerateDoorInTopWall = topLeftCorner.y - 1 > margin;
    const canGenerateDoorInBottomWall = bottomRightCorner.y + 1 < tiles[0].length - margin;
    const canGenerateDoorInLeftWall = topLeftCorner.x - 1 > margin;
    const canGenerateDoorInRightWall = bottomRightCorner.x + 1 < tiles.length - margin;

    const doors: Array<{position: Position, direction: Direction}> = [];

    let outDoorsCount;
    const roll = Math.random();
    if (roll < 0.3) {
      outDoorsCount = 1;
    } else if (roll < 0.75) {
      outDoorsCount = 2;
    } else {
      outDoorsCount = 3;
    }
    this.debug.log(`Trying to generate ${outDoorsCount} doors...`);
    const allowedWalls: Direction[] = [
      canGenerateDoorInTopWall && direction !== Direction.Down ? Direction.Up : null,
      canGenerateDoorInBottomWall && direction !== Direction.Up ? Direction.Down : null,
      canGenerateDoorInLeftWall && direction !== Direction.Right ? Direction.Left : null,
      canGenerateDoorInRightWall && direction !== Direction.Left ? Direction.Right : null
    ].filter(Boolean) as Direction[];
    this.debug.log(`allowedWalls: ${JSON.stringify(allowedWalls)}`);
    for (let i = 0; i < outDoorsCount; i++) {
      const idx = Math.floor(Math.random() * allowedWalls.length);
      const wall = allowedWalls.splice(idx, 1)[0];
      switch (wall) {
        case Direction.Up: {
          const x = Math.floor(Math.random() * width) + topLeftCorner.x;
          if (!tiles[x][topLeftCorner.y - 1]) {
            tiles[x][topLeftCorner.y - 1] = new FloorTile();
            doors.push({position: new Position(x, topLeftCorner.y - 1), direction: Direction.Up});
          }
          break;
        }
        case Direction.Left: {
          const y = Math.floor(Math.random() * height) + topLeftCorner.y;
          if (!tiles[topLeftCorner.x - 1][y]) {
            tiles[topLeftCorner.x - 1][y] = new FloorTile();
            doors.push({position: new Position(topLeftCorner.x - 1, y), direction: Direction.Left});
          }
          break;
        }
        case Direction.Right: {
          const y = Math.floor(Math.random() * height) + topLeftCorner.y;
          if (!tiles[bottomRightCorner.x + 1][y]) {
            tiles[bottomRightCorner.x + 1][y] = new FloorTile();
            doors.push({position: new Position(bottomRightCorner.x + 1, y), direction: Direction.Right});
          }
          break;
        }
        case Direction.Down: {
          const x = Math.floor(Math.random() * width) + topLeftCorner.x;
          if (!tiles[x][bottomRightCorner.y + 1]) {
            tiles[x][bottomRightCorner.y + 1] = new FloorTile();
            doors.push({position: new Position(x, bottomRightCorner.y + 1), direction: Direction.Down});
          }
          break;
        }
      }
    }

    let torchesCount: number;
    if (width === 1 || height === 1) {
      torchesCount = 0;
    } else  {
      const roll = Math.random();
      if (roll < 0.5) {
        torchesCount = 0;
      } else if (roll < 0.85) {
        torchesCount = 1;
      } else {
        torchesCount = 2;
      }
    }
    for (let i = 0; i < torchesCount; i++) {
      const allowedWalls: Direction[] = [
        canGenerateDoorInTopWall ? Direction.Up : null,
        canGenerateDoorInBottomWall ? Direction.Down : null,
        canGenerateDoorInLeftWall ? Direction.Left : null,
        canGenerateDoorInRightWall ? Direction.Right : null
      ].filter(Boolean) as Direction[];
      const wall = allowedWalls[Math.floor(Math.random() * allowedWalls.length)];
      switch (wall) {
        case Direction.Up: {
          const x = Math.floor(Math.random() * width) + topLeftCorner.x;
          if (!tiles[x][topLeftCorner.y - 1]) {
            tiles[x][topLeftCorner.y] = new TorchTile();
          }
          break;
        }
        case Direction.Down: {
          const x = Math.floor(Math.random() * width) + topLeftCorner.x;
          if (!tiles[x][bottomRightCorner.y + 1]) {
            tiles[x][bottomRightCorner.y] = new TorchTile();
          }
          break;
        }
        case Direction.Left: {
          const y = Math.floor(Math.random() * height) + topLeftCorner.y;
          if (!tiles[topLeftCorner.x - 1][y]) {
            tiles[topLeftCorner.x][y] = new TorchTile();
          }
          break;
        }
        case Direction.Right: {
          const y = Math.floor(Math.random() * height) + topLeftCorner.y;
          if (!tiles[bottomRightCorner.x + 1][y]) {
            tiles[bottomRightCorner.x][y] = new TorchTile();
          }
          break;
        }
      }
    }

    this.debug.log(`doors: ${JSON.stringify(doors)}`);
    this.debug.log(`generateRoom from ${entrance.serialize()}, direction: ${direction} done!`);
    return {doors, freeTiles};
  }

  private generateSurfaceLevel(): LevelTemplate {
    this.debug.log(`generateSurfaceLevel...`);
    const width = 200;
    const height = 100;
    const initialPosition = new Position(20, Math.floor(height / 2));

    const tiles: Tile[][] = [];
    const freeTiles: Set<SerializedPosition> = new Set();

    for (let i = 0; i < width; i++) {
      tiles[i] = [];
      for (let j = 0; j < height; j++) {
        if (Math.random() > 0.95 && i !== initialPosition.x && j !== initialPosition.y) {
          tiles[i][j] = new TreeTile();
        } else {
          tiles[i][j] = new GrassTile();
          freeTiles.add(new Position(i, j).serialize());
        }
        tiles[i][j].setExplored(true);
      }
    }

    for (let k = 0; k < 10; k++) {
      const lakePosition = new Position(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
      if (lakePosition.manhattanDistanceTo(initialPosition) < 20) {
        continue;
      }
      tiles[lakePosition.x][lakePosition.y] = new WaterTile();
      tiles[lakePosition.x][lakePosition.y].setExplored(true);
      freeTiles.delete(lakePosition.serialize());
      this.spreadLake(tiles, freeTiles, initialPosition, width, height, lakePosition);
    }

    const entrancePosition = new Position(width - 1, Math.floor(Math.random() * height));
    tiles[entrancePosition.x][entrancePosition.y] = new StairsDownTile();
    tiles[entrancePosition.x][entrancePosition.y].setExplored(true);

    for (let i = entrancePosition.x - 3; i <= entrancePosition.x; i++) {
      for (let j = Math.max(0, entrancePosition.y - 3); j <= Math.min(height - 1, entrancePosition.y + 3); j++) {
        if ((i === entrancePosition.x - 3 || j === entrancePosition.y - 3 || j === entrancePosition.y + 3) && j !== entrancePosition.y) {
          tiles[i][j] = new WallTile();
          tiles[i][j].setExplored(true);
        }
      }
    }


    const map = new GameMap(this.context, tiles, initialPosition, width, height, this.containerWidth, this.containerHeight);

    this.debug.log(`generateSurfaceLevel done!`);
    return {level: new Level(0, map), freeTiles: Array.from(freeTiles.values()).map(Position.deserialize)};
  }

  private spreadLake(tiles: Tile[][], freeTiles: Set<SerializedPosition>, initialPosition: Position, width: number, height: number, position: Position, limit = 5): void {
    if (limit === 0 || Math.random() < 0.18) {
      for (let i = Math.max(position.x - 1, 0); i <= Math.min(position.x + 1, width - 1); i++) {
        for (let j = Math.max(position.y - 1, 0); j <= Math.min(position.y + 1, height - 1); j++) {
          if (!(tiles[i][j] instanceof WaterTile)) {
            tiles[i][j] = new ShallowWaterTile();
            tiles[i][j].setExplored(true);
          }
        }
      }
      return;
    }

    for (let i = Math.max(position.x - Math.ceil(Math.random() * 3), 0); i <= Math.min(position.x + Math.ceil(Math.random() * 3), width - 1); i++) {
      for (let j = Math.max(position.y - Math.ceil(Math.random() * 3), 0); j <= Math.min(position.y + Math.ceil(Math.random() * 3), height - 1); j++) {
        if (Math.random() < 0.4 && new Position(i, j).manhattanDistanceTo(initialPosition) > 20) {
          tiles[i][j] = new WaterTile();
          tiles[i][j].setExplored(true);
          freeTiles.delete(new Position(i, j).serialize());
          this.spreadLake(tiles, freeTiles, initialPosition, width, height, new Position(i, j), limit - 1);
        }
      }
    }
  }
}

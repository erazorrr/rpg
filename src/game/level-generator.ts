import {GameObject} from "./abstract.game-object";
import {Level} from "./level";
import {GameMap} from "./game.map";
import {TreeTile} from "./tiles/tree.tile";
import {GrassTile} from "./tiles/grass.tile";
import {Position} from "../io/position";
import {WaterTile} from "./tiles/water.tile";
import {Tile} from "./tiles/abstract.tile";
import {ShallowWaterTile} from "./tiles/shallow-water.tile";
import {Context} from "./context";
import {Goblin} from "./monsters/goblin";
import {Wolf} from "./monsters/wolf";
import {Ogre} from "./monsters/ogre";
import {Skeleton} from "./monsters/skeleton";
import {StrengthMonsterModifier} from "./monster-modufiers/strength";
import {DexterityMonsterModifier} from "./monster-modufiers/dexterity";
import {EnduranceMonsterModifier} from "./monster-modufiers/endurance";
import {SpectralHitMonsterModifier} from "./monster-modufiers/spectral-hit";
import {StairsDownTile} from "./tiles/stairs-down.tile";
import {StairsUpTile} from "./tiles/stairs-up.tile";
import {FloorTile} from "./tiles/floor.tile";
import {WallTile} from "./tiles/wall.tile";

enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export class LevelGenerator extends GameObject {
  constructor(context: Context, private containerWidth, private containerHeight) {
    super(context);
  }

  private startingAreaSize = 50;
  private generateSurfaceAreaNpcs(level: Level) {
    const startingPosition = level.map.getInitialPosition();
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
    } while (!level.map.isNavigable(position) || level.getNpcAt(position) || level.map.getInitialPosition().equals(position));

    const initialMonster = new Goblin(this.context, position);
    level.putNpc(initialMonster);

    for (let i = 0; i < 50; i++) {
      do {
        let x;
        if (Math.random() < 0.5) {
          x = startingPosition.x + this.startingAreaSize + Math.floor(Math.random() * (level.map.width - this.startingAreaSize * 2 - startingPosition.x));
        } else {
          x = startingPosition.x - this.startingAreaSize - Math.floor(Math.random() * (startingPosition.x - this.startingAreaSize));
        }
        let y;
        if (Math.random() < 0.5) {
          y = startingPosition.y + this.startingAreaSize + Math.floor(Math.random() * (level.map.height - this.startingAreaSize * 2 - startingPosition.y));
        } else {
          y = startingPosition.y - this.startingAreaSize - Math.floor(Math.random() * (startingPosition.y - this.startingAreaSize));
        }
        position = new Position(x, y);
      } while (!level.map.isNavigable(position) || level.getNpcAt(position) || level.map.getInitialPosition().equals(position));
      const monster = Math.random() < 0.5 ? new Goblin(this.context, position) : new Wolf(this.context, position);
      level.putNpc(monster);
    }
  }

  private npcs = [
    [[] as any, [] as any[]],
    [[Goblin, Wolf], []],
    [[Ogre, Goblin, Wolf], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier]],
    [[Ogre, Skeleton, Goblin], [StrengthMonsterModifier, DexterityMonsterModifier, EnduranceMonsterModifier, SpectralHitMonsterModifier]],
  ] as const;
  private generateNpcs(level: Level) {
    if (level.levelNo === 0) {
      this.generateSurfaceAreaNpcs(level);
      return;
    }

    const npcCount = 700;
    const [npcs, _modifiers] = this.npcs[level.levelNo];
    for (let i = 0; i < npcCount; i++) {
      let position: Position;
      do {
        const x = Math.floor(Math.random() * level.map.width);
        const y = Math.floor(Math.random() * level.map.height);
        position = new Position(x, y);
      } while (!level.map.isNavigable(position) || level.getNpcAt(position) || level.findTile(StairsUpTile).equals(position));
      const npc = new npcs[Math.floor(Math.random() * npcs.length)](this.context, position);
      const modifiersRoll = Math.floor(Math.random() * 100);
      let modifiersCount;
      if (modifiersRoll < 50) {
        modifiersCount = 0;
      } else if (modifiersRoll < 75) {
        modifiersCount = 1;
      } else if (modifiersRoll < 97) {
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
      level.putNpc(npc);
    }
  }

  public generateLevel(i: number, previousLevel?: Level): Level {
    let level: Level;
    if (i === 0) {
      let path: Position[];
      do {
        level = this.generateSurfaceLevel();
        path = this.context.buildPath(level.map.getInitialPosition(), level.findTile(StairsDownTile), 1000, level.map);
      } while (path.length === 0);
    } else {
      level = this.generateDungeonLevel(i, previousLevel);
    }
    this.generateNpcs(level);
    return level;
  }

  private generateDungeonLevel(i: number, previousLevel: Level): Level {
    const width = 1000;
    const height = 1000;

    const stairsPosition: Position = previousLevel.findTile(StairsDownTile);
    if (!stairsPosition) {
      throw new Error(`No stairs down found during ${i} generation`);
    }
    const initialPosition = stairsPosition;
    const tiles: Tile[][] = []
    for (let i = 0; i < width; i++) {
      tiles[i] = [];
      for (let j = 0; j < height; j++) {
        tiles[i].push(undefined);
      }
    }

    tiles[initialPosition.x][initialPosition.y] = new StairsUpTile();

    let doors: Array<{position: Position, direction: Direction}>;
    for (const direction of [Direction.Up, Direction.Down, Direction.Left, Direction.Right]) {
      const initial = this.generateRoom(tiles, initialPosition, direction, 1000);
      if (initial) {
        doors = initial;
        break;
      }
    }
    if (!doors) {
      throw new Error(`Cannot create initial room at ${i}`);
    }

    let roomsCount = 1;
    let lastDoor: Position;
    while (doors.length > 0) {
      const {position, direction} = doors.shift();
      const newDoors = this.generateRoom(tiles, position, direction);
      const wasRoomGenerated = newDoors !== null;
      if (!wasRoomGenerated) {
        if (doors.length === 0 && !lastDoor) {
          // turning the door into a stairs
          tiles[position.x][position.y] = new StairsDownTile();
          lastDoor = position;
        } else {
          // removing the door
          tiles[position.x][position.y] = undefined;
        }
      } else {
        doors.push(...newDoors);
        roomsCount++;
      }
    }

    do {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (tiles[x][y] instanceof FloorTile && new Position(x, y).distanceTo(initialPosition) > 200) {
        tiles[x][y] = new StairsDownTile();
        lastDoor = new Position(x, y);
      }
    } while (!lastDoor);

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (!tiles[i][j]) {
          tiles[i][j] = new WallTile();
        }
      }
    }

    const map = new GameMap(this.context, tiles, initialPosition, width, height, this.containerWidth, this.containerHeight);
    return new Level(i, map);
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

  private generateRoom(tiles: Tile[][], entrance: Position, direction: Direction, tries = 20): Array<{position: Position, direction: Direction}> | null {
    let triesLeft = tries;
    let width: number;
    let height: number;
    let topLeftCorner: Position;
    let bottomRightCorner: Position;
    do {
      if (triesLeft-- === 0) {
        return null;
      }
      if (Math.random() < 0.2) {
        // corridor
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

    for (let i = topLeftCorner.x; i <= bottomRightCorner.x; i++) {
      for (let j = topLeftCorner.y; j <= bottomRightCorner.y; j++) {
        tiles[i][j] = new FloorTile();
      }
    }

    const margin = 8;
    const canGenerateDoorInTopWall = topLeftCorner.y - 1 > margin;
    const canGenerateDoorInBottomWall = bottomRightCorner.y + 1 < tiles[0].length - margin;
    const canGenerateDoorInLeftWall = topLeftCorner.x - 1 > margin;
    const canGenerateDoorInRightWall = bottomRightCorner.x + 1 < tiles.length - margin;

    const doors: Array<{position: Position, direction: Direction}> = [];

    let outDoorsCount;
    let roll = Math.random();
    if (roll < 0.3) {
      outDoorsCount = 1;
    } else if (roll < 0.75) {
      outDoorsCount = 2;
    } else {
      outDoorsCount = 3;
    }
    const allowedWalls: Direction[] = [
      canGenerateDoorInTopWall && direction !== Direction.Down ? Direction.Up : null,
      canGenerateDoorInBottomWall && direction !== Direction.Up ? Direction.Down : null,
      canGenerateDoorInLeftWall && direction !== Direction.Right ? Direction.Left : null,
      canGenerateDoorInRightWall && direction !== Direction.Left ? Direction.Right : null
    ].filter(Boolean) as Direction[];
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

    return doors;
  }

  private generateSurfaceLevel(): Level {
    const width = 400;
    const height = 120;
    const initialPosition = new Position(100, Math.floor(height / 2));

    const tiles: Tile[][] = [];

    for (let i = 0; i < width; i++) {
      tiles[i] = [];
      for (let j = 0; j < height; j++) {
        if (Math.random() > 0.95 && i !== initialPosition.x && j !== initialPosition.y) {
          tiles[i][j] = new TreeTile();
        } else {
          tiles[i][j] = new GrassTile();
        }
      }
    }

    for (let k = 0; k < 10; k++) {
      const lakePosition = new Position(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
      if (lakePosition.distanceTo(initialPosition) < 20) {
        continue;
      }
      tiles[lakePosition.x][lakePosition.y] = new WaterTile();
      this.spreadLake(tiles, initialPosition, width, height, lakePosition);
    }

    // TODO better entrance
    tiles[width - 1][Math.floor(Math.random() * height)] = new StairsDownTile();

    const map = new GameMap(this.context, tiles, initialPosition, width, height, this.containerWidth, this.containerHeight);

    return new Level(0, map);
  }

  private spreadLake(tiles: Tile[][], initialPosition: Position, width: number, height: number, position: Position, limit = 5): void {
    if (limit === 0 || Math.random() < 0.18) {
      for (let i = Math.max(position.x - 1, 0); i <= Math.min(position.x + 1, width - 1); i++) {
        for (let j = Math.max(position.y - 1, 0); j <= Math.min(position.y + 1, height - 1); j++) {
          if (!(tiles[i][j] instanceof WaterTile)) {
            tiles[i][j] = new ShallowWaterTile();
          }
        }
      }
      return;
    }

    for (let i = Math.max(position.x - Math.ceil(Math.random() * 3), 0); i <= Math.min(position.x + Math.ceil(Math.random() * 3), width - 1); i++) {
      for (let j = Math.max(position.y - Math.ceil(Math.random() * 3), 0); j <= Math.min(position.y + Math.ceil(Math.random() * 3), height - 1); j++) {
        if (Math.random() < 0.4 && new Position(i, j).distanceTo(initialPosition) > 20) {
          tiles[i][j] = new WaterTile();
          this.spreadLake(tiles, initialPosition, width, height, new Position(i, j), limit - 1);
        }
      }
    }
  }
}

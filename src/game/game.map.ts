import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {Renderer} from "../io/renderer";
import {Tile} from "./tiles/abstract.tile";
import {TreeTile} from "./tiles/tree.tile";
import {GrassTile} from "./tiles/grass.tile";
import {GameObject} from "./abstract.game-object";
import {Context} from "./context";
import {WaterTile} from "./tiles/water.tile";
import {ShallowWaterTile} from "./tiles/shallow-water.tile";

export class GameMap extends GameObject implements Renderable {
  public WIDTH = 1000;
  public HEIGHT = 1000;
  private INITIAL_POSITION = new Position(Math.floor(this.WIDTH / 2), Math.floor(this.HEIGHT / 2));

  private tiles: Tile[][] = [];

  constructor(context: Context, private readonly containerWidth, private readonly containerHeight) {
    super(context);
    this.generateTiles();
  }

  private generateTiles() {
    for (let i = 0; i < this.WIDTH; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.HEIGHT; j++) {
        if (Math.random() > 0.95 && i !== this.INITIAL_POSITION.x && j !== this.INITIAL_POSITION.y) {
          this.tiles[i][j] = new TreeTile();
        } else {
          this.tiles[i][j] = new GrassTile();
        }
      }
    }

    for (let k = 0; k < 100; k++) {
      const lakePosition = new Position(Math.floor(Math.random() * this.WIDTH), Math.floor(Math.random() * this.HEIGHT));
      this.tiles[lakePosition.x][lakePosition.y] = new WaterTile();
      this.spreadLake(lakePosition);
    }
    return this.tiles;
  }

  private spreadLake(position: Position, limit = 5): void {
    if (limit === 0 || Math.random() < 0.18) {
      for (let i = Math.max(position.x - 1, 0); i <= Math.min(position.x + 1, this.WIDTH - 1); i++) {
        for (let j = Math.max(position.y - 1, 0); j <= Math.min(position.y + 1, this.HEIGHT - 1); j++) {
          if (!(this.tiles[i][j] instanceof WaterTile)) {
            this.tiles[i][j] = new ShallowWaterTile();
          }
        }
      }
      return;
    }

    for (let i = Math.max(position.x - Math.ceil(Math.random() * 3), 0); i <= Math.min(position.x + Math.ceil(Math.random() * 3), this.WIDTH - 1); i++) {
      for (let j = Math.max(position.y - Math.ceil(Math.random() * 3), 0); j <= Math.min(position.y + Math.ceil(Math.random() * 3), this.HEIGHT - 1); j++) {
        if (Math.random() < 0.4) {
          this.tiles[i][j] = new WaterTile();
          this.spreadLake(new Position(i, j), limit - 1);
        }
      }
    }
  }

  public getInitialPosition(): Position {
    return this.INITIAL_POSITION;
  }

  getTile(position: Position): Tile | undefined {
    return this.tiles[position.x]?.[position.y];
  }

  isNavigable(position: Position): boolean {
    return this.tiles[position.x] && this.tiles[position.x][position.y] && this.tiles[position.x][position.y].isNavigable();
  }

  getTopLeftCorner(): Position {
    const player = this.context.getPlayer().position;
    const startX = Math.min(Math.max(0, Math.floor(player.x - this.containerWidth / 2)), this.WIDTH - this.containerWidth);
    const startY = Math.min(Math.max(0, Math.floor(player.y - this.containerHeight / 2)), this.HEIGHT - this.containerHeight);
    return new Position(startX, startY);
  }

  getBottomRightCorner(): Position {
    const tlc = this.getTopLeftCorner();
    return new Position(tlc.x + this.containerWidth, tlc.y + this.containerHeight);
  }

  render(renderer: Renderer) {
    const topLeftCorner = this.getTopLeftCorner();
    const startX = topLeftCorner.x;
    const startY = topLeftCorner.y;

    for (let i = startX; i < Math.min(startX + this.containerWidth, this.WIDTH); i++) {
      for (let j = startY; j < Math.min(startY + this.containerHeight, this.HEIGHT); j++) {
        renderer.put(new Position(i - startX, j - startY), this.tiles[i][j].getChar());
      }
    }
  }
}

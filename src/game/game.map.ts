import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {Renderer} from "../io/renderer";
import {Tile} from "./tiles/abstract.tile";
import {GameObject} from "./abstract.game-object";
import {Context} from "./context";

export class GameMap extends GameObject implements Renderable {
  constructor(context: Context, private tiles: Tile[][], private initialPosition: Position, public width: number, public height: number, private readonly containerWidth, private readonly containerHeight) {
    super(context);
  }

  public getInitialPosition(): Position {
    return this.initialPosition;
  }

  getTile(position: Position): Tile | undefined {
    return this.tiles[position.x]?.[position.y];
  }

  isNavigable(position: Position): boolean {
    return this.tiles[position.x] && this.tiles[position.x][position.y] && this.tiles[position.x][position.y].isNavigable();
  }

  getTopLeftCorner(): Position {
    const player = this.context.getPlayer().position;
    const startX = Math.min(Math.max(0, Math.floor(player.x - this.containerWidth / 2)), this.width - this.containerWidth);
    const startY = Math.min(Math.max(0, Math.floor(player.y - this.containerHeight / 2)), this.height - this.containerHeight);
    return new Position(startX, startY);
  }

  getBottomRightCorner(): Position {
    const tlc = this.getTopLeftCorner();
    return new Position(tlc.x + this.containerWidth, tlc.y + this.containerHeight);
  }

  setTile(position: Position, tile: Tile): void {
    this.tiles[position.x][position.y] = tile;
  }

  render(renderer: Renderer) {
    const topLeftCorner = this.getTopLeftCorner();
    const startX = topLeftCorner.x;
    const startY = topLeftCorner.y;

    for (let i = startX; i < Math.min(startX + this.containerWidth, this.width); i++) {
      for (let j = startY; j < Math.min(startY + this.containerHeight, this.height); j++) {
        renderer.put(new Position(i - startX, j - startY), this.tiles[i][j].getChar());
      }
    }
  }
}

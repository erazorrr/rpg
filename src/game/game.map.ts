import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {Renderer} from "../io/renderer";
import {Tile} from "./tiles/abstract.tile";
import {GameObject} from "./abstract.game-object";
import {Context} from "./context";
import {TorchTile} from "./tiles/torch.tile";
import {FloorTile} from "./tiles/floor.tile";
import {BackgroundColor} from "../io/background.color";

export class GameMap extends GameObject implements Renderable {
  constructor(context: Context, private tiles: Tile[][], private initialPosition: Position, public width: number, public height: number, private containerWidth: number, private containerHeight: number) {
    super(context);
  }

  public setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
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

  private TORCH_RADIUS = 6;
  render(renderer: Renderer) {
    const topLeftCorner = this.getTopLeftCorner();
    const startX = topLeftCorner.x;
    const startY = topLeftCorner.y;

    for (let i = startX; i < Math.min(startX + this.containerWidth, this.width); i++) {
      for (let j = startY; j < Math.min(startY + this.containerHeight, this.height); j++) {
        renderer.put(new Position(i - startX, j - startY), this.tiles[i][j].getChar());
      }
    }

    const torches: Position[] = [];
    for (let i = Math.max(0, startX - this.TORCH_RADIUS); i < Math.min(startX + this.containerWidth + this.TORCH_RADIUS, this.width); i++) {
      for (let j = Math.max(0, startY - this.TORCH_RADIUS); j < Math.min(startY + this.containerHeight + this.TORCH_RADIUS, this.height); j++) {
        if (this.tiles[i][j] instanceof TorchTile && !this.context.getPlayer().position.equals(new Position(i, j)) && !this.context.getCharacter(new Position(i, j))) {
          torches.push(new Position(i, j));
        }
      }
    }


    for (const torch of torches) {
      for (let i = torch.x - this.TORCH_RADIUS; i <= torch.x + this.TORCH_RADIUS; i++) {
        for (let j = torch.y - this.TORCH_RADIUS; j <= torch.y + this.TORCH_RADIUS; j++) {
          if (!this.tiles[i]?.[i] || !(this.tiles[i][j] instanceof FloorTile) || !this.tiles[i][j].isExplored()) {
            continue;
          }
          const position = new Position(i, j);
          if (position.distanceTo(torch) <= this.TORCH_RADIUS) {
            if (this.isVisible(torch, position, this.TORCH_RADIUS)) {
              renderer.put(new Position(i - startX, j - startY), {
                ...this.tiles[i][j].getChar(),
                backgroundColor: this.tiles[i][j].getIsBloody() ? BackgroundColor.Red3a : BackgroundColor.Orange4b,
              });
            }
          }
        }
      }
    }

    for (const torch of torches) {
      const flickeringRoll = Math.random() < 0.1 ? 1 : 0;
      for (let i = torch.x - this.TORCH_RADIUS; i <= torch.x + this.TORCH_RADIUS; i++) {
        for (let j = torch.y - this.TORCH_RADIUS; j <= torch.y + this.TORCH_RADIUS; j++) {
          if (!this.tiles[i]?.[i] || !(this.tiles[i][j] instanceof FloorTile) || !this.tiles[i][j].isExplored()) {
            continue;
          }
          const position = new Position(i, j);
          if (position.distanceTo(torch) <= (2 + flickeringRoll)) {
            if (this.isVisible(torch, position, this.TORCH_RADIUS)) {
              renderer.put(new Position(i - startX, j - startY), {
                ...this.tiles[i][j].getChar(),
                backgroundColor: this.tiles[i][j].getIsBloody() ? BackgroundColor.Red3a : BackgroundColor.LightGoldenrod3,
              });
            }
          }
        }
      }
    }
  }
}

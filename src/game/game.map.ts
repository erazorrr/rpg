import {Renderable} from "../io/renderable.interface";
import {Position} from "../io/position";
import {Renderer} from "../io/renderer";
import {Tile} from "./tiles/abstract.tile";
import {GameObject} from "./abstract.game-object";
import {Context} from "./context";
import {MapSave, Saveable} from "./save-data";
import {restoreTile} from "./tiles/tile.factory";
import {AnimationFrame} from "./animation";
import {sampleLight, strongestLight} from './tile-light';
import {ForegroundColor} from '../io/foreground.color';
import {BackgroundColor} from '../io/background.color';

export class GameMap extends GameObject implements Renderable, Saveable<MapSave> {
  constructor(
    context: Context,
    private tiles: Tile[][],
    private initialPosition: Position,
    public width: number,
    public height: number,
    private containerWidth: number,
    private containerHeight: number,
  ) {
    super(context);
  }

  public setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  public getInitialPosition(): Position {
    return this.initialPosition;
  }

  public toSaveData(): MapSave {
    return {
      width: this.width,
      height: this.height,
      initialPosition: this.initialPosition,
      tiles: this.tiles.map(column => column.map(tile => tile.toSaveData())),
    };
  }

  public static fromSaveData(
    context: Context,
    data: MapSave,
    containerWidth: number,
    containerHeight: number,
  ): GameMap {
    const tiles = data.tiles.map(column => column.map(tile => restoreTile(tile, context)));
    return new GameMap(
      context,
      tiles,
      new Position(data.initialPosition.x, data.initialPosition.y),
      data.width,
      data.height,
      containerWidth,
      containerHeight,
    );
  }

  getTile(position: Position): Tile | undefined {
    return this.tiles[position.x]?.[position.y];
  }

  isNavigable(position: Position): boolean {
    return this.tiles[position.x] && this.tiles[position.x][position.y] && this.tiles[position.x][position.y].isNavigable();
  }

  getTopLeftCorner(): Position {
    const player = this.context.getPlayer().position;
    const maxStartX = Math.max(0, this.width - this.containerWidth);
    const maxStartY = Math.max(0, this.height - this.containerHeight);
    const startX = Math.min(Math.max(0, Math.floor(player.x - this.containerWidth / 2)), maxStartX);
    const startY = Math.min(Math.max(0, Math.floor(player.y - this.containerHeight / 2)), maxStartY);
    return new Position(startX, startY);
  }

  getBottomRightCorner(): Position {
    const tlc = this.getTopLeftCorner();
    return new Position(tlc.x + this.containerWidth, tlc.y + this.containerHeight);
  }

  setTile(position: Position, tile: Tile): void {
    this.tiles[position.x][position.y] = tile;
  }

  private static readonly MAX_LIGHT_RADIUS = 6;
  render(renderer: Renderer, frame?: AnimationFrame) {
    const topLeftCorner = this.getTopLeftCorner();
    const startX = topLeftCorner.x;
    const startY = topLeftCorner.y;
    const usesFogOfWar = this.context.getCurrentGameLevel().usesFogOfWar();

    for (let i = startX; i < Math.min(startX + this.containerWidth, this.width); i++) {
      for (let j = startY; j < Math.min(startY + this.containerHeight, this.height); j++) {
        const target = new Position(i, j);
        const tile = this.tiles[i][j];
        const visible = tile.isExplored() && (!usesFogOfWar || this.context.getPlayer().canSeeTerrain(target));
        const char = tile.getChar(frame, target);
        renderer.put(new Position(i - startX, j - startY), tile.isExplored() && !visible ? {
          ...char,
          color: ForegroundColor.Grey37,
          backgroundColor: BackgroundColor.Black,
        } : char);
      }
    }

    const sources: Array<{position: Position; light: NonNullable<ReturnType<Tile['getLight']>>}> = [];
    const radius = GameMap.MAX_LIGHT_RADIUS;
    for (let i = Math.max(0, startX - radius); i < Math.min(startX + this.containerWidth + radius, this.width); i++) {
      for (let j = Math.max(0, startY - radius); j < Math.min(startY + this.containerHeight + radius, this.height); j++) {
        const position = new Position(i, j);
        const light = this.tiles[i][j].getLight(frame, position);
        if (light) sources.push({position, light});
      }
    }
    for (let i = startX; i < Math.min(startX + this.containerWidth, this.width); i++) {
      for (let j = startY; j < Math.min(startY + this.containerHeight, this.height); j++) {
        const target = new Position(i, j);
        const tile = this.tiles[i][j];
        if (!tile.isExplored() || usesFogOfWar && !this.context.getPlayer().canSeeTerrain(target)) continue;
        const samples = sources.flatMap(source => {
          const sample = sampleLight(source.light, source.position, target, tile.getIsBloody());
          if (!sample || !this.isVisible(source.position, target, source.light.radius + 1)) return [];
          if (tile.blocksLight() && usesFogOfWar && !this.context.getPlayer().canSeeTerrain(source.position)) return [];
          return [sample];
        });
        const selected = strongestLight(samples);
        if (selected) renderer.put(new Position(i - startX, j - startY), {...tile.getChar(frame, target), backgroundColor: selected.color});
      }
    }
  }
}

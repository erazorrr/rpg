import {BackgroundColor} from '../../io/background.color';
import {Char} from '../../io/char';
import {ForegroundColor} from '../../io/foreground.color';
import {Position} from '../../io/position';
import {Context} from '../context';
import {Item, ItemType} from '../item';

export class VeyranSurveyMap extends Item {
  public static readonly saveId = 'veyran-survey-map';
  private static readonly REVEAL_WIDTH = 35;
  private static readonly REVEAL_HEIGHT = 21;
  private static readonly MIN_USEFUL_TILES = 150;

  constructor(context: Context) {
    super(context, ItemType.Map, {}, 20);
  }

  public getBaseName(): string {
    return 'Veyran Survey Map';
  }

  public getChar(): Char {
    return {
      char: 'M',
      color: ForegroundColor.Wheat4,
      backgroundColor: BackgroundColor.Black,
    };
  }

  public reveal(): number {
    const level = this.context.getCurrentGameLevel();
    if (!level.usesFogOfWar()) return 0;

    const map = level.map;
    const candidates: Array<{position: Position; unexplored: number}> = [];
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const position = new Position(x, y);
        const tile = map.getTile(position);
        if (!tile?.isNavigable() || tile.isExplored()) continue;
        candidates.push({position, unexplored: this.countUnexplored(position)});
      }
    }
    if (candidates.length === 0) return 0;

    const usefulCandidates = candidates.filter(candidate => candidate.unexplored >= VeyranSurveyMap.MIN_USEFUL_TILES);
    const choices = usefulCandidates.length > 0 ? usefulCandidates : candidates;
    const center = choices[Math.floor(Math.random() * choices.length)].position;
    return this.revealAround(center);
  }

  private countUnexplored(center: Position): number {
    let count = 0;
    this.forEachPositionAround(center, position => {
      const tile = this.context.getCurrentMap().getTile(position);
      if (tile && !tile.isExplored()) count++;
    });
    return count;
  }

  private revealAround(center: Position): number {
    let revealed = 0;
    this.forEachPositionAround(center, position => {
      const tile = this.context.getCurrentMap().getTile(position);
      if (tile && !tile.isExplored()) {
        tile.setExplored(true);
        revealed++;
      }
    });
    return revealed;
  }

  private forEachPositionAround(center: Position, visit: (position: Position) => void): void {
    const halfWidth = Math.floor(VeyranSurveyMap.REVEAL_WIDTH / 2);
    const halfHeight = Math.floor(VeyranSurveyMap.REVEAL_HEIGHT / 2);
    for (let x = center.x - halfWidth; x <= center.x + halfWidth; x++) {
      for (let y = center.y - halfHeight; y <= center.y + halfHeight; y++) {
        visit(new Position(x, y));
      }
    }
  }
}

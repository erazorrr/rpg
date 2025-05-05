import {Renderable} from "./renderable.interface";
import {Renderer} from "./renderer";
import {Char} from "./char";
import {ForegroundColor} from "./foreground.color";
import {BackgroundColor} from "./background.color";
import {Position} from "./position";
import * as process from "node:process";

export class Field extends Renderer implements Renderable  {
  constructor(
    private readonly title: string = '',
    protected readonly ltPosition: Position = new Position(0, 0),
    protected readonly rbPosition: Position = new Position(process.stdout.columns - 1, process.stdout.rows),
    protected readonly bordered: boolean = true,
  ) {
    super();
  }

  private color: ForegroundColor = ForegroundColor.White;
  private backgroundColor: BackgroundColor = BackgroundColor.Black;
  private LTC: Char = {
    char: '╔',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };
  private RTC: Char = {
    char: '╗',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };
  private LBC: Char = {
    char: '╚',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };
  private RBC: Char = {
    char: '╝',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };
  private H: Char = {
    char: '═',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };
  private V: Char = {
    char: '║',
    color: this.color,
    backgroundColor: this.backgroundColor,
  };

  put(position: Position, c: Char) {
    const targetPosition = position.shift(this.ltPosition.x + 1, this.ltPosition.y + 1);
    if (targetPosition.x < this.ltPosition.x + 1 || targetPosition.y < this.ltPosition.y + 1) {
      return;
    }
    if (targetPosition.x > this.rbPosition.x - 1 || targetPosition.y > this.rbPosition.y - 1) {
      return;
    }
    super.put(targetPosition, c);
  }

  render(renderer: Renderer): void {
    if (this.bordered) {
      renderer.put(this.ltPosition, this.LTC);
      renderer.put(new Position(this.ltPosition.x, this.rbPosition.y), this.LBC);
      renderer.put(this.rbPosition, this.RBC);
      renderer.put(new Position(this.rbPosition.x, this.ltPosition.y), this.RTC);

      let x = this.ltPosition.x + 1;
      const titleStart = Math.floor((this.rbPosition.x - this.title.length) / 2);
      while (x < titleStart) {
        renderer.put(new Position(x, this.ltPosition.y), this.H);
        x++;
      }
      for (let i = 0; i < this.title.length; i++) {
        renderer.put(new Position(x, this.ltPosition.y), {
          char: this.title[i],
          color: this.color,
          backgroundColor: this.backgroundColor,
        });
        x++;
      }
      while (x < this.rbPosition.x) {
        renderer.put(new Position(x, this.ltPosition.y), this.H);
        x++;
      }
      for (let x = this.ltPosition.x + 1; x < this.rbPosition.x; x++) {
        renderer.put(new Position(x, this.rbPosition.y), this.H);
      }
      for (let y = this.ltPosition.y + 1; y < this.rbPosition.y; y++) {
        renderer.put(new Position(this.ltPosition.x, y), this.V);
        renderer.put(new Position(this.rbPosition.x, y), this.V);
      }
    }

    for (let x = this.ltPosition.x + 1; x < this.rbPosition.x; x++) {
      for (let y = this.ltPosition.y + 1; y < this.rbPosition.y; y++) {
        renderer.put(new Position(x, y), {
          char: ' ',
          color: this.color,
          backgroundColor: this.backgroundColor,
        });
      }
    }
  }

  getWidth(): number {
    return this.rbPosition.x - this.ltPosition.x - 1;
  }

  getHeight(): number {
    return this.rbPosition.y - this.ltPosition.y - 1;
  }
}

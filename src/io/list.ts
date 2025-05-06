import {Field} from "./field";
import {Position} from "./position";
import {Renderer} from "./renderer";
import {ForegroundColor} from "./foreground.color";
import {BackgroundColor} from "./background.color";
import {InputEmitter} from "./input.emitter";
import {InputEvent} from "./input.event";

export class List extends Field {
  private activeId: string | undefined;
  private emitter = new InputEmitter();

  constructor(
    title: string = '',
    private readonly items: Array<{id: string, label: string, onSelect: () => void}> = [],
    ltPosition: Position = new Position(0, 0),
    rbPosition: Position = new Position(process.stdout.columns - 1, process.stdout.rows),
    bordered: boolean = true,
    activeId = items[0]?.id,
  ) {
    super(title, ltPosition, rbPosition, bordered);
    this.activeId = activeId;
  }

  public makeInteractive(renderer: Renderer): void {
    this.emitter.on(InputEvent.ARROW_UP, this, () => {
      if (this.items.length === 0) {
        return;
      }
      if (this.activeId === this.items[0].id) {
        this.activeId = this.items[this.items.length - 1].id;
      } else {
        const index = this.items.findIndex(i => i.id === this.activeId);
        this.activeId = this.items[index - 1].id;
      }
      this.render(renderer);
    });

    this.emitter.on(InputEvent.ARROW_DOWN, this, () => {
      if (this.items.length === 0) {
        return;
      }
      if (this.activeId === this.items[this.items.length - 1].id) {
        this.activeId = this.items[0].id;
      } else {
        const index = this.items.findIndex(i => i.id === this.activeId);
        this.activeId = this.items[index + 1].id;
      }
      this.render(renderer);
    });

    this.emitter.on(InputEvent.ENTER, this, () => {
      if (this.items.length === 0) {
        return;
      }
      this.items.find(i => i.id === this.activeId)?.onSelect();
    });
  }

  public makeUninteractive(): void {
    this.emitter.clear(this);
  }

  render(renderer: Renderer) {
    super.render(renderer);

    const x = this.ltPosition.x + 1;
    let y = this.ltPosition.y + 1;
    for (const item of this.items) {
      for (let i = 0; i < item.label.length; i++) {
        renderer.put(new Position(x + i, y), {
          char: item.label[i],
          color: this.activeId === item.id ? ForegroundColor.White : ForegroundColor.Grey50,
          backgroundColor: BackgroundColor.Black,
        });
      }
      y++;
    }

    renderer.flush();
  }

  getActiveId() {
    return this.activeId;
  }
}

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
  private scrollOffset = 0;

  constructor(
    title: string = '',
    private readonly items: Array<{id: string, label: string, onSelect: () => void}>,
    ltPosition: Position,
    rbPosition: Position,
    bordered: boolean = true,
    activeId = items[0]?.id,
    private readonly emptyLabel = '',
  ) {
    super(title, ltPosition, rbPosition, bordered);
    this.activeId = activeId;
  }

  public setBounds(ltPosition: Position, rbPosition: Position): void {
    super.setBounds(ltPosition, rbPosition);
    this.ensureActiveItemIsVisible();
  }

  private getVisibleRowCount(): number {
    return Math.max(0, this.getHeight());
  }

  private ensureActiveItemIsVisible(): void {
    const activeIndex = this.items.findIndex(item => item.id === this.activeId);
    const visibleRows = this.getVisibleRowCount();
    if (activeIndex === -1 || visibleRows === 0) {
      this.scrollOffset = 0;
      return;
    }
    if (activeIndex < this.scrollOffset) this.scrollOffset = activeIndex;
    if (activeIndex >= this.scrollOffset + visibleRows) {
      this.scrollOffset = activeIndex - visibleRows + 1;
    }
    this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, Math.max(0, this.items.length - visibleRows)));
  }

  public makeInteractive(renderer: Renderer): void {
    this.emitter.clear(this);

    this.emitter.on(InputEvent.ARROW_UP, this, () => {
      if (this.items.length === 0) {
        return;
      }
      if (this.activeId === this.items[0].id) {
        this.activeId = this.items[this.items.length - 1].id;
      } else {
        let index = this.items.findIndex(i => i.id === this.activeId);
        if (index === -1) {
          index = this.items.length;
        }
        this.activeId = this.items[index - 1].id;
      }
      this.ensureActiveItemIsVisible();
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
      this.ensureActiveItemIsVisible();
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
    const contentWidth = Math.max(0, this.getWidth());
    const visibleRows = this.getVisibleRowCount();
    if (this.items.length === 0) {
      for (let i = 0; i < Math.min(this.emptyLabel.length, contentWidth); i++) {
        renderer.put(new Position(x + i, y), {
          char: this.emptyLabel[i],
          color: ForegroundColor.Grey50,
          backgroundColor: BackgroundColor.Black,
        });
      }
    }
    const visibleItems = this.items.slice(this.scrollOffset, this.scrollOffset + visibleRows);
    for (const item of visibleItems) {
      for (let i = 0; i < Math.min(item.label.length, contentWidth); i++) {
        renderer.put(new Position(x + i, y), {
          char: item.label[i],
          color: this.activeId === item.id ? ForegroundColor.White : ForegroundColor.Grey50,
          backgroundColor: BackgroundColor.Black,
        });
      }
      y++;
    }

    renderer.flush(true);
  }

  getActiveId() {
    return this.activeId;
  }
}

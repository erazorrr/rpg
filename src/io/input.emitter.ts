import {InputEvent} from "./input.event";

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

let escTimeout: NodeJS.Timeout | null = null;

process.stdin.on('data', (_key) => {
  const key = _key.toString();
  if (key === '\u0003') { // Ctrl+C
    process.stdout.write('\x1b[?25h'); // Show cursor before exit
    process.exit();
  }

  switch (key) {
    case '\x1b[A': queue.get(InputEvent.ARROW_UP)?.forEach(c => c(key)); break;
    case '\x1b[B': queue.get(InputEvent.ARROW_DOWN)?.forEach(c => c(key)); break;
    case '\x1b[C': queue.get(InputEvent.ARROW_RIGHT)?.forEach(c => c(key)); break;
    case '\x1b[D': queue.get(InputEvent.ARROW_LEFT)?.forEach(c => c(key)); break;

    case '\r': queue.get(InputEvent.ENTER)?.forEach(c => c(key)); break;
    case '\x7f': queue.get(InputEvent.BACKSPACE)?.forEach(c => c(key)); break;
    default:
  }

  if (key === '\x1b') {
    if (escTimeout) clearTimeout(escTimeout);
    escTimeout = setTimeout(() => {
      queue.get(InputEvent.ESCAPE)?.forEach(c => c(key));
      escTimeout = null;
    }, 50);
    return;
  }
});

const queue: Map<InputEvent, Array<(s?: string) => void>> = new Map();

export class InputEmitter {
  private static instance: InputEmitter;

  constructor() {
    return InputEmitter.instance;
  }

  private mapping: Map<Object, Set<(s?: string) => void>> = new Map();
  on(event: InputEvent, o: Object, callback: (s?: string) => void) {
    if (!queue.has(event)) {
      queue.set(event, []);
    }
    queue.get(event).push(callback);

    if (!this.mapping.has(o)) {
      this.mapping.set(o, new Set);
    }
    this.mapping.get(o).add(callback);
  }

  clear(o: Object) {
    for (const event of queue.keys()) {
      queue.set(event, queue.get(event).filter(c => !this.mapping.get(o).has(c)));
    }
  }
}

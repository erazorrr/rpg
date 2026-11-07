import {BackgroundColor} from './background.color';
import {ForegroundColor} from './foreground.color';
import {Position} from './position';
import {Renderer} from './renderer';

describe('Renderer', () => {
  test('clearing the display invalidates the previous-frame cache', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const renderer = new Renderer();
    const char = {
      char: 'x',
      color: ForegroundColor.White,
      backgroundColor: BackgroundColor.Black,
    };

    renderer.put(new Position(0, 0), char);
    renderer.flush(false);
    renderer.clear();
    expect(write.mock.calls.some(([value]) => `${value}`.includes('\x1b[2J\x1b[H'))).toBe(true);

    write.mockClear();
    renderer.put(new Position(0, 0), char);
    renderer.flush(true);
    expect(write).toHaveBeenCalled();
    write.mockRestore();
  });
});

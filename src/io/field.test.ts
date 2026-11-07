import {BackgroundColor} from "./background.color";
import {Field} from "./field";
import {ForegroundColor} from "./foreground.color";
import {Position} from "./position";
import {Renderer} from "./renderer";

describe('Field', () => {
  test('renders its border and title with the configured border color', () => {
    const field = new Field('HP', new Position(0, 0), new Position(5, 3));
    const renderer = new Renderer();
    const put = jest.spyOn(renderer, 'put').mockImplementation(() => undefined);

    field.setBorderColor(ForegroundColor.Red);
    field.render(renderer);

    const borderChars = put.mock.calls
      .map(([, char]) => char)
      .filter(char => char.backgroundColor === BackgroundColor.Black && char.char !== ' ');
    expect(borderChars).not.toHaveLength(0);
    expect(borderChars.every(char => char.color === ForegroundColor.Red)).toBe(true);
  });
});

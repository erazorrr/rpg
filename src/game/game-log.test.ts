import {GameLog} from "./game-log";
import {Renderer} from "../io/renderer";

describe('GameLog', () => {
  it('does not finish a log cycle merely because it renders', () => {
    const put = jest.fn();
    const renderer = {put} as unknown as Renderer;
    const gameLog = new GameLog(30);

    gameLog.log('Hero shoots Rift Wisp for 4 damage!');
    gameLog.render(renderer);
    gameLog.log('Rift Wisp shoots Hero for 2 damage!');
    put.mockClear();

    gameLog.render(renderer);

    const entryMarkers = put.mock.calls.filter(([, char]) => char.char === '>');
    expect(entryMarkers).toHaveLength(2);
  });

  it('clears completed-cycle messages when the next message arrives', () => {
    const put = jest.fn();
    const renderer = {put} as unknown as Renderer;
    const gameLog = new GameLog(30);

    gameLog.log('Old message');
    gameLog.finishCycle();
    gameLog.log('New message');
    gameLog.render(renderer);

    const entryMarkers = put.mock.calls.filter(([, char]) => char.char === '>');
    expect(entryMarkers).toHaveLength(1);
  });
});

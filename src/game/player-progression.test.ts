jest.mock('../io/input.emitter', () => ({
  InputEmitter: class {
    public on(): void {}
    public clear(): void {}
  },
}));

import {Context} from './context';
import {Player} from './player';
import {Position} from '../io/position';
import {LevelUpPopup} from './level-up-popup';

function createPlayer(): {player: Player; messages: string[]} {
  const messages: string[] = [];
  const world: {player?: Player} = {};
  const context = {
    getPlayer: () => world.player!,
    log: (message: string) => messages.push(message),
    postGameMessage: () => {},
  } as unknown as Context;
  const player = new Player(context, new Position(0, 0), false);
  world.player = player;
  return {player, messages};
}

describe('Player progression', () => {
  it('awards three attribute points per level', () => {
    expect(LevelUpPopup.ATTRIBUTE_POINTS).toBe(3);
  });

  it('announces Order recognition only when crossing a rank boundary', () => {
    const {player, messages} = createPlayer();
    player.level = 2;
    player.xp = player.nextLevelXp() - 1;

    player.addXp(1);

    expect(messages).toEqual([
      'Hero reached level 3!',
      'The Order recognizes you as an Initiate.',
    ]);
  });

  it('does not announce recognition within the same rank', () => {
    const {player, messages} = createPlayer();
    player.level = 4;
    player.xp = player.nextLevelXp() - 1;

    player.addXp(1);

    expect(messages).toEqual(['Hero reached level 5!']);
  });
});

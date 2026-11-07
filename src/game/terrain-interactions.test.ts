jest.mock('../io/input.emitter', () => ({
  InputEmitter: class { public on(): void {} public clear(): void {} },
}));

import {Position} from '../io/position';
import {Context} from './context';
import {Game} from './game';
import {GameMap} from './game.map';
import {GameMessage} from './game-message';
import {Level} from './level';
import {Player} from './player';
import {CaveFloorTile} from './tiles/cave-floor.tile';
import {CrystalClusterTile} from './tiles/crystal-cluster.tile';
import {FloorTile} from './tiles/floor.tile';
import {MoldFloorTile} from './tiles/mold-floor.tile';
import {PressureValveTile} from './tiles/pressure-valve.tile';
import {SporePodTile} from './tiles/spore-pod.tile';
import {ThornFungusTile} from './tiles/thorn-fungus.tile';
import {SearingGrateTile} from './tiles/searing-grate.tile';
import {FrostGeodeTile} from './tiles/frost-geode.tile';
import {AshUrnTile} from './tiles/ash-urn.tile';
import {PoisonedState} from './states/poisoned.state';
import {BurningState} from './states/burning.state';
import {FrozenState} from './states/frozen.state';
import {EmberworksFloorTile} from './tiles/emberworks-floor.tile';
import {FlagstoneFloorTile} from './tiles/flagstone-floor.tile';
import {GlowingMushroomTile} from './tiles/glowing-mushroom.tile';

class MovingPlayer extends Player {
  public enter(position: Position): void { this.moveToPosition(position); }
}

function levelWithTile(
  position: Position,
  tile: FloorTile | CrystalClusterTile | PressureValveTile | SporePodTile | ThornFungusTile |
    SearingGrateTile | FrostGeodeTile | AshUrnTile | GlowingMushroomTile,
) {
  const holder: {level?: Level; player?: Player} = {};
  const messages: string[] = [];
  const context = {
    getPlayer: () => holder.player!,
    getCurrentMap: () => holder.level!.map,
    getCurrentGameLevel: () => holder.level!,
    log: (message: string) => messages.push(message),
  } as unknown as Context;
  const tiles = Array.from({length: 5}, () => Array.from({length: 5}, () => new FloorTile()));
  tiles[position.x][position.y] = tile;
  const map = new GameMap(context, tiles, new Position(1, 2), 5, 5, 5, 5);
  holder.level = new Level(1, map);
  holder.player = new MovingPlayer(context, new Position(1, 2), false);
  return {context, level: holder.level, player: holder.player as MovingPlayer, messages};
}

function gameStub(level: Level, player: Player | {getName(): string} = {getName: () => 'Hero'}) {
  const messages: string[] = [];
  const tick = jest.fn();
  const render = jest.fn();
  const game = Object.create(Game.prototype) as Game;
  Object.assign(game as object, {
    levels: [level],
    currentLevelIndex: 0,
    player,
    gameLog: {log: (message: string) => messages.push(message)},
    recordTelemetry: jest.fn(),
    tick,
    render,
  });
  return {game: game as unknown as {receiveGameMessage(message: GameMessage): void}, messages, tick, render};
}

describe('interactive terrain', () => {
  it('describes a walkable feature only on the Hero\'s first entry', () => {
    const position = new Position(2, 2);
    const mushroom = new GlowingMushroomTile('earthy-scent');
    const {player, messages} = levelWithTile(position, mushroom);

    player.enter(position);
    player.enter(new Position(1, 2));
    player.enter(position);

    expect(messages.filter(message => message === mushroom.getStepMessages()[0])).toHaveLength(1);
    expect(mushroom.hasShownStepMessages()).toBe(true);
  });

  it('turns a stepped-on spore pod into mold and emits fog', () => {
    const position = new Position(2, 2);
    const {level, player, messages} = levelWithTile(position, new SporePodTile());

    player.enter(position);

    expect(level.map.getTile(position)).toBeInstanceOf(MoldFloorTile);
    expect(level.getAtmosphere(position)?.kind).toBe('fog');
    expect(level.getAtmosphere(position.up())?.kind).toBe('fog');
    expect(messages).toContain('Hero ruptures a spore pod! Pale fog billows out.');
  });

  it('consumes thorn fungus and searing grates while applying their conditions', () => {
    const position = new Position(2, 2);
    const thorn = levelWithTile(position, new ThornFungusTile());
    thorn.player.enter(position);

    expect(thorn.level.map.getTile(position)).toBeInstanceOf(MoldFloorTile);
    expect(Array.from(thorn.player.states).some(state => state instanceof PoisonedState)).toBe(true);

    const grate = levelWithTile(position, new SearingGrateTile());
    grate.player.enter(position);

    expect(grate.level.map.getTile(position)).toBeInstanceOf(EmberworksFloorTile);
    expect(Array.from(grate.player.states).some(state => state instanceof BurningState)).toBe(true);
  });

  it('shatters a crystal cluster and consumes exactly one turn', () => {
    const position = new Position(2, 2);
    const {level} = levelWithTile(position, new CrystalClusterTile());
    const {game, tick} = gameStub(level);

    game.receiveGameMessage(GameMessage.shatterCrystal(position));

    expect(level.map.getTile(position)).toBeInstanceOf(CaveFloorTile);
    expect(tick).toHaveBeenCalledTimes(1);
  });

  it('vents steam once and does not charge a turn for a spent valve', () => {
    const position = new Position(2, 2);
    const valve = new PressureValveTile();
    const {level} = levelWithTile(position, valve);
    const {game, tick, render, messages} = gameStub(level);

    game.receiveGameMessage(GameMessage.activatePressureValve(position));
    expect(valve.isSpent()).toBe(true);
    expect(level.getAtmosphere(position.right())?.kind).toBe('steam');
    expect(tick).toHaveBeenCalledTimes(1);

    game.receiveGameMessage(GameMessage.activatePressureValve(position));
    expect(tick).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(messages).toContain('The pressure valve has already vented.');
  });

  it('shatters a frost geode and freezes adjacent characters', () => {
    const position = new Position(2, 2);
    const {level, player} = levelWithTile(position, new FrostGeodeTile());
    const {game, tick} = gameStub(level, player);

    game.receiveGameMessage(GameMessage.shatterFrostGeode(position));

    expect(level.map.getTile(position)).toBeInstanceOf(CaveFloorTile);
    expect(Array.from(player.states).some(state => state instanceof FrozenState)).toBe(true);
    expect(tick).toHaveBeenCalledTimes(1);
  });

  it('shatters an ash urn into flagstone and releases smoke', () => {
    const position = new Position(2, 2);
    const {level} = levelWithTile(position, new AshUrnTile());
    const {game, tick} = gameStub(level);

    game.receiveGameMessage(GameMessage.shatterAshUrn(position));

    expect(level.map.getTile(position)).toBeInstanceOf(FlagstoneFloorTile);
    expect(level.getAtmosphere(position)?.kind).toBe('smoke');
    expect(tick).toHaveBeenCalledTimes(1);
  });
});

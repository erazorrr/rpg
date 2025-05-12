import {CharacterGameObject} from "./character.game-object";

export enum GameMessageType {
  NewGame,
  MainMenu,
  Exit,
  Kill,
  Die,
  PickUp,
  Move,
}

export class GameMessage {
  constructor(
    public readonly type: GameMessageType,
    public readonly payload?: object,
  ) {}

  static newGame(): GameMessage {
    return new GameMessage(GameMessageType.NewGame);
  }

  static exit(): GameMessage {
    return new GameMessage(GameMessageType.Exit)
  }

  static move(dx: number, dy: number): GameMessage {
    return new GameMessage(GameMessageType.Move, {dx, dy});
  }

  static kill(character: CharacterGameObject): GameMessage {
    return new GameMessage(GameMessageType.Kill, {character});
  }

  static die(): GameMessage {
    return new GameMessage(GameMessageType.Die);
  }

  static pickUp(): GameMessage {
    return new GameMessage(GameMessageType.PickUp);
  }
}

import {Player} from "./player";
import {GameMap} from "./game.map";
import {GameMessage} from "./game-message";
import {Renderer} from "../io/renderer";
import {Position} from "../io/position";
import {CharacterGameObject} from "./character.game-object";

export interface Context {
  getPlayer(): Player;
  getCurrentMap(): GameMap;
  postGameMessage(message: GameMessage): void;
  getRenderer(): Renderer;
  tick(): void;
  getIsFree(position: Position): boolean;
  getCharacter(position: Position): CharacterGameObject;
  buildPath(start: Position, end: Position, maxRadius: number): Position[];
  log(message: string): void;
}

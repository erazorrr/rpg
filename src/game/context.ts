import {Player} from "./player";
import {GameMap} from "./game.map";
import {GameMessage} from "./game-message";
import {Renderer} from "../io/renderer";
import {Position} from "../io/position";
import {CharacterGameObject} from "./character.game-object";
import {Item} from "./item";
import {Level} from "./level";

export interface Context {
  getPlayer(): Player;
  getCurrentMap(): GameMap;
  postGameMessage(message: GameMessage): void;
  getRenderer(): Renderer;
  tick(): void;
  getIsFree(position: Position): boolean;
  getCharacter(position: Position): CharacterGameObject | undefined;
  getItem(position: Position): Item | undefined;
  buildPath(start: Position, end: Position, maxRadius: number, map?: GameMap): Position[];
  log(message: string): void;
  destroyNpc(npc: CharacterGameObject): void;
  getCurrentGameLevel(): Level;
}

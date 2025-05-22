import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";
import {BurningState} from "./burning.state";

export class FrozenState extends State {
  constructor(turns: number) {
    super({
      isUnableToMove: true,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} froze!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} unfroze!`;
  }

  getIncompatibleStates() {
    return new Set([BurningState]);
  }
}

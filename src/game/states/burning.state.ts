import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";
import {FrozenState} from "./frozen.state";

export class BurningState extends State {
  constructor(turns: number, damagePerTurn: number) {
    super({
      damagePerTurn,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} caught on fire!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} managed to extinguish the fire!`;
  }

  getIncompatibleStates() {
    return new Set([FrozenState]);
  }
}

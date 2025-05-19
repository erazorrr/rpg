import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";

export class ArmorState extends State {
  constructor(turns: number) {
    super({
      armor: 10,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} suddenly feels sturdier!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s sturdiness fades away!`;
  }
}

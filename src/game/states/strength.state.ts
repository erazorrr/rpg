import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";

export class StrengthState extends State {
  constructor(turns: number, strengthBonus: number) {
    super({
      strengthBonus,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} suddenly feels stronger!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s strength fades away!`;
  }

  getName(): string {
    return "Empowered";
  }
}

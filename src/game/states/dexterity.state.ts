import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";

export class DexterityState extends State {
  constructor(turns: number, dexterityBonus: number) {
    super({
      dexterityBonus,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} suddenly feels agile!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s agility fades away!`;
  }

  getName(): string {
    return "Agile";
  }
}

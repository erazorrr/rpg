import {State} from "../state";
import {CharacterGameObject} from "../character.game-object";

export class WisdomState extends State {
  public static readonly saveId = "wisdom";

  constructor(turns: number, wisdomBonus: number) {
    super({
      wisdomBonus,
    }, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} suddenly feels wiser!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s insight fades away!`;
  }

  getName(): string {
    return "Wise";
  }
}

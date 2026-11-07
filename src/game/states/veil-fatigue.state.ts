import {CharacterGameObject} from '../character.game-object';
import {State} from '../state';

export class VeilFatigueState extends State {
  public static readonly saveId = 'veil-fatigue';

  constructor(turns: number) {
    super({}, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s veil magic is spent.`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()}'s veil magic recovers.`;
  }

  getName(): string { return 'Veil Fatigue'; }
}

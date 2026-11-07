import {ForegroundColor} from '../../io/foreground.color';
import {CharacterGameObject} from '../character.game-object';
import {State} from '../state';

export class PoisonedState extends State {
  public static readonly saveId = 'poisoned';

  constructor(turns: number, damagePerTurn = 1) {
    super({damagePerTurn, damageType: 'poison'}, turns);
  }

  public getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} is poisoned!`;
  }

  public getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} is no longer poisoned.`;
  }

  public getForegroundColor(): ForegroundColor {
    return ForegroundColor.GreenYellow;
  }

  public getName(): string {
    return 'Poisoned';
  }
}

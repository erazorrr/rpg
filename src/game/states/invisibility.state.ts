import {CharacterGameObject} from '../character.game-object';
import {State} from '../state';
import {ForegroundColor} from '../../io/foreground.color';

export class InvisibilityState extends State {
  public static readonly saveId = 'invisibility';

  constructor(turns: number) {
    super({isInvisible: true}, turns);
  }

  getActiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} vanishes from sight!`;
  }

  getInactiveMessage(character: CharacterGameObject): string {
    return `${character.getName()} becomes visible again!`;
  }

  getForegroundColor(): ForegroundColor {
    return ForegroundColor.LightCyan1;
  }

  getName(): string { return 'Invisible'; }
}

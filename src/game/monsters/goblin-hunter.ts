import {Char} from "../../io/char";
import {ForegroundColor} from "../../io/foreground.color";
import {BackgroundColor} from "../../io/background.color";
import {Goblin} from "./goblin";
import {Bow} from "../items/weapons/bow";
import {LeatherArmor} from "../items/chest/leather-armor";

export class GoblinHunter extends Goblin {
  endurance = 1;

  getChar(): Char {
    return {
      char: 'g',
      color: ForegroundColor.GreenYellow,
      backgroundColor: BackgroundColor.Green,
    };
  }

  getBaseName(): string {
    return 'Goblin hunter';
  }

  getXp(): number {
    return 120;
  }

  getBaseLootCost(): number {
    return 5;
  }

  public equipment = {
    weapon: new Bow(this.context),
    chest: new LeatherArmor(this.context),
  };

  getIsBloody(): boolean {
    return true;
  }
}

import {Context} from "../../context";
import {Book} from "./book";

export class LightGoesFirstBook extends Book {
  public static readonly saveId = 'book-light-goes-first';

  constructor(context: Context) {
    super(context, 'The Light Goes First', [
      'Before the Great Ascent, men lived divided, ignorant, and afraid. Cyranth brought them peace, and the Ordered Flame gave that peace a name.',
      'Beyond the lamp wait the Unshaped, the risen dead, and every error creation left unfinished. A Lantern enters the dark so that ordinary men need never see what was destroyed for them.',
      'Safety is purchased by service. Civilization ends wherever the last brave man refuses to take one step forward.',
    ]);
  }
}

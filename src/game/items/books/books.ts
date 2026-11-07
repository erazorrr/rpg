import {Context} from "../../context";
import {Book} from "./book";

export class NovicesFirstLightBook extends Book {
  public static readonly saveId = 'book-novices-first-light';

  constructor(context: Context) {
    super(context, "The Novice's First Light", [
      'A Lantern does not enter the dark seeking glory. He enters because others cannot. Behind him stand the farmer at his plough, the child at her lessons, and every honest soul who sleeps without a sword beside the bed.',
      'Within the Deeps, vigilance is devotion. Mark every passage, recover every relic, and suffer no work of the Unshaped to endanger the settlements above. Pity must never become permission.',
      'When your lamp trembles, remember that fear is merely the body asking whether duty remains. Answer it by taking one more step.',
    ]);
  }
}

export class IllustratedHistoryOfTheGreatAscentBook extends Book {
  public static readonly saveId = 'book-illustrated-history-great-ascent';

  constructor(context: Context) {
    super(context, 'An Illustrated History of the Great Ascent', [
      'Our grandfathers inherited a realm divided by mud roads, petty crowns, and jealous customs. Within one brilliant century, Cyranthian engineers spanned the rivers, artificers harnessed hidden forces, and disciplined armies carried the Ordered Flame beyond every old frontier.',
      'The southern princes called unity conquest. Veyran pamphleteers called peace occupation. History has little patience for the complaints of those who stood before the future and demanded that it halt.',
      'Observe Plate Seventeen: the submission of the Veyran crown. The artist has placed dawn behind the Cyranthian delegation, an embellishment in composition but not in meaning.',
    ]);
  }
}

export class TravelersCompanionToVeyraBook extends Book {
  public static readonly saveId = 'book-travelers-companion-veyra';

  constructor(context: Context) {
    super(context, "A Traveler's Companion to Veyra", [
      'The Veyran hills are beautiful in the austere manner of an old blade. Roads twist unnecessarily, milestones retain obsolete royal markings, and villagers may pretend not to understand perfectly ordinary Cyranthian speech.',
      'Travelers should avoid discussing the former royal family, missing livestock, or lights seen upon the hills after midnight. Inns are inexpensive, though the local custom of leaving an empty chair at supper can make crowded rooms appear deceptively welcoming.',
      'The provincial authorities assure visitors that banditry is declining. Sensible visitors will nevertheless hire two guards and tell each that the other carries the money.',
    ]);
  }
}

export class SurveyNotesLanternSiteSevenBook extends Book {
  public static readonly saveId = 'book-survey-notes-lantern-site-seven';

  constructor(context: Context) {
    super(context, 'Survey Notes: Lantern Site Seven', [
      'The upper workings contain crude fortifications, cookfires, animal pens, and quantities of Veyran-made cloth. These findings suggest occupation extending beyond a transient raiding party. The inhabitants appear to call the site "Emberdeep," though this name does not occur in Order records.',
      'Air quality remains unusually high at depth. Several streams are warm and potable, while pale growths persist without sunlight. Compasses, prayer needles, and two calibrated thaumic gauges all incline toward the lowest accessible chambers.',
      'Expedition losses prevent a complete survey. Future parties are advised that whatever sustains the site may also explain why its inhabitants defend it with such determination.',
    ], true);
  }
}

export class ThirtySevenUsesForTurnipsBook extends Book {
  public static readonly saveId = 'book-thirty-seven-uses-for-turnips';

  constructor(context: Context) {
    super(context, 'Thirty-Seven Uses for Turnips', [
      'A turnip boiled is dependable; a turnip baked is respectable. Mashed with pepper and goose fat, it may even receive guests, provided the guests were not promised venison beforehand.',
      'Do not discard the greens. Soldiers, children, and husbands seldom identify them once chopped into gravy. The peel may be dried for stock, fed to hens, or placed in the boots of an unwelcome lodger.',
      'The thirty-seventh use is disputed. My grandmother swore that a turnip beneath the bed discourages both fever and infidelity. Grandfather suffered from neither, though he did complain about the smell.',
    ]);
  }
}

export class BrassGardenerBook extends Book {
  public static readonly saveId = 'book-brass-gardener';

  constructor(context: Context) {
    super(context, 'The Brass Gardener', [
      "Master Pell wound the gardener at dawn. By breakfast it had pruned the roses, the hedge, and both sleeves from the magistrate's coat. When seized, the machine continued opening and closing its shears with impeccable calm.",
      '"Precision," Pell told the court, "is not the same as judgment." The magistrate replied that this distinction had become apparent when his trousers were assessed as an ornamental shrub.',
      "The gardener clicked politely from the evidence table. No one noticed it working loose the wire around its wrists until the judge's wig fell neatly into three equal pieces. The court then adjourned to the public house, where judgment was restored with brandy.",
    ]);
  }
}

export class KissBeforeTheSiegeBook extends Book {
  public static readonly saveId = 'book-kiss-before-the-siege';

  constructor(context: Context) {
    super(context, 'A Kiss Before the Siege', [
      'Elira found Captain Vaun upon the western wall, his blue coat whitened by mortar dust. Below them, enemy drums rolled through the valley, and every cup of water upon the battlements trembled.',
      '"You promised me a dance," she said. Vaun looked toward the burning orchards, then bowed as though they stood beneath chandeliers instead of falling ash. "I promised you three."',
      'They turned once together before the first stones struck the gate. Years later, veterans would disagree about which army broke the siege and which banner flew at dawn. Yet every account remembered the woman in the red dress, dancing on the wall while the city shook beneath her feet.',
    ]);
  }
}

export class MillersCleverDaughterBook extends Book {
  public static readonly saveId = 'book-millers-clever-daughter';

  constructor(context: Context) {
    super(context, "The Miller's Clever Daughter", [
      'The duke demanded a riddle no scholar could answer, promising a purse of gold to the victor and a week in the stocks to every failure. For six days, the finest minds in the province discovered how cold the town square became after sunset.',
      'On the seventh day, Mara the miller\'s daughter wrote something upon a flour sack and sent it to the castle. The duke opened the sack, found it empty, and summoned her at once. "What answer have you given me?"',
      '"Nothing," said Mara. "That is the one answer your scholars feared to offer." The duke kept his gold, but married his eldest son to her—which, Mara later observed, was how powerful men avoided admitting defeat.',
    ]);
  }
}

export class EtiquetteOfVictoriousOfficersBook extends Book {
  public static readonly saveId = 'book-etiquette-victorious-officers';

  constructor(context: Context) {
    super(context, 'The Etiquette of Victorious Officers', [
      'Accept surrender without smiling. A victory already announces itself and does not require assistance from your face. Permit the defeated commander to retain one glove, provided its mate has been formally yielded.',
      'At dinner, captured banners belong behind the chair of the senior officer. They must never be used as tablecloths, regardless of their condition or the quality of the wine. Prisoners of noble rank should be seated according to their former titles, which makes the insult both orderly and unmistakable.',
      'Should the enemy unexpectedly resume hostilities, overturn the table toward them. This maneuver is not considered poor etiquette if performed before dessert.',
    ]);
  }
}

export class SevenSuppersAtTheCrookedCrownBook extends Book {
  public static readonly saveId = 'book-seven-suppers-crooked-crown';

  constructor(context: Context) {
    super(context, 'Seven Suppers at the Crooked Crown', [
      'On the first night, the stranger paid in silver. On the second, she paid with a ruby button cut from a coat no tailor in the city would admit to making. On the third, she requested two bowls and ate from neither.',
      'By the fifth night, the innkeeper had stopped asking about the hood that concealed her face. By the sixth, every dog in the street had fled, and frost covered the inside of the windows despite the midsummer heat.',
      "On the seventh night, he locked the doors, set one bowl before the cold hearth, and waited upstairs for morning. At dawn the bowl was empty, the silver had turned black, and muddy footprints led from the fireplace to his daughter's room.",
    ]);
  }
}

export class EmberdeepProvisionLedgerBook extends Book {
  public static readonly saveId = 'book-emberdeep-provision-ledger';

  constructor(context: Context) {
    super(context, 'Emberdeep Provision Ledger', [
      'Six sacks of barley received through the western route. Salt, lamp oil, needles, and winter cloth received in lesser quantities. ' +
        'Payment deferred again. The carter accepted this after considerable argument.',
      'Deliveries assigned to the Ash Gate, the lower kobold warrens, the gnome lodge, and the families quartered above the old crypt. ' +
        'The newcomers beneath the cistern are to receive double water until their children recover.',
      'The Night House asks that the northern post remain unbarred after sunset. Its hunters still take no blood from those granted refuge ' +
        'and feed only beyond the outer markers. Armed surface intruders, they note, are not guests.',
    ], true);
  }
}

export class JournalOfAdeptMarenBook extends Book {
  public static readonly saveId = 'book-journal-adept-maren';

  constructor(context: Context) {
    super(context, 'Journal of Adept Maren', [
      'Site Seven is no abandoned mine. Barricades are maintained, sentries exchange signals, and cavern beasts wear braided collars or ' +
        'painted shells. Ancient fountains still mend living flesh, while frost engines fire down the same fixed passages without choosing a side.',
      'We found an Order clasp beside a Veyran loaf wrapped in fresh cloth. Brother Edrin called it proof of treachery. Sister Caldus asked ' +
        'whose clasp it had been. They argued until something began moving beyond the door.',
      'Our remaining oil may last two days. If the lower stair is still held, I will conceal these pages and attempt the flooded passage. ' +
        'Whoever follows us should distrust any corridor the defenders appear willing to surrender.',
    ], true);
  }
}

export class EmberkeepersAlmanacBook extends Book {
  public static readonly saveId = 'book-emberkeepers-almanac';

  constructor(context: Context) {
    super(context, "The Emberkeeper's Almanac", [
      'In the year of the cracked bell, the western spring ran bitter for nine days. The Ember was veiled with ash, and clean water returned. ' +
        'In the year of red moths, its warmth failed before dawn but recovered when the lower vents were cleared.',
      'No keeper living can say who placed the Ember or what fire turns within it. Rift wisps gather whenever its light changes, though we ' +
        'cannot tell whether they are sparks cast off by the Ember or creatures drawn to its disturbance.',
      'Renew the ash marks upon the crypt doors, and the old guardians will remember their posts. Should the Ember be broken or carried away, ' +
        'seek the upper roads immediately. The wells will cool first. Then the pale gardens will fail, and at last the deep air will cease to move.',
    ], true);
  }
}

export class ElementaryPrinciplesOfThaumicIndustryBook extends Book {
  public static readonly saveId = 'book-elementary-principles-thaumic-industry';

  constructor(context: Context) {
    super(context, 'Elementary Principles of Thaumic Industry', [
      'Magic in its natural condition is wasteful, temperamental, and dangerously impressed with itself. Industry begins when a disciplined ' +
        'mind persuades it to repeat the same useful act twice.',
      'A proper thaumic engine requires a source, a regulator, and an obedient material through which force may travel. Brass is preferred ' +
        'because it conducts enchantment well and complains less than an apprentice.',
      "Cyranth's Great Ascent was not built upon miracles. It was built upon measurements, replaceable parts, and the discovery that wonder " +
        'becomes progress once it can be manufactured by the hundred.',
    ]);
  }
}

export class ProvincialLanternsBestiaryBook extends Book {
  public static readonly saveId = 'book-provincial-lanterns-bestiary';

  constructor(context: Context) {
    super(context, "A Provincial Lantern's Bestiary", [
      'Wolves hunt from hunger, raised dead from command, and vampires from an appetite sharpened by memory. Calling all three monsters is ' +
        'convenient. Assuming they therefore behave alike is an excellent way to be buried far from home.',
      'Observe before striking. The beasts of some Deeps answer to whistles, feeding bells, or scents their keepers prepare. A painted beetle, ' +
        'collared spider, or hand-fed asp may guard a passage as faithfully as any hound.',
      'Regarding the Unshaped, doctrine is sufficient for judgment but insufficient for tactics. A Lantern who confuses certainty with ' +
        'preparation will soon possess only the former.',
    ]);
  }
}

export class MushroomsOfTheLowerRoadsBook extends Book {
  public static readonly saveId = 'book-mushrooms-lower-roads';

  constructor(context: Context) {
    super(context, 'Mushrooms of the Lower Roads', [
      'The blue lantern-cap is edible after boiling and produces a gentle light when bruised. Do not confuse it with the widow-cap, which ' +
        'produces a similar light in anyone unfortunate enough to swallow it.',
      'Stone ears grow where warm water passes behind a cavern wall. Their presence may reveal a hidden spring. Their taste has been compared ' +
        'to old leather by people inclined to insult leather.',
      'When uncertain, feed a specimen to neither companion nor pack animal. Sketch it, leave it rooted, and remain content with hunger. ' +
        'Hunger commonly passes; several interesting fungal conditions do not.',
    ]);
  }
}

export class ClockmakerAndTheMoonBook extends Book {
  public static readonly saveId = 'book-clockmaker-and-the-moon';

  constructor(context: Context) {
    super(context, 'The Clockmaker and the Moon', [
      'Each night the clockmaker watched the moon cross his workshop window. Convinced that its wandering showed defective workmanship, ' +
        'he built a ladder of gears tall enough to reach the sky.',
      'At the summit he found no loose spring, no winding key, and no maker\'s mark. The moon merely continued upon its way while the ' +
        'clockmaker\'s magnificent ladder began shedding pieces into the sea.',
      'He returned home and constructed a clock which lost one minute every night. Whenever customers complained, he told them that perfect ' +
        'things belonged in heaven and charged extra for the resemblance.',
    ]);
  }
}

export class BalladsOfOldVeyraBook extends Book {
  public static readonly saveId = 'book-ballads-old-veyra';

  constructor(context: Context) {
    super(context, 'Ballads of Old Veyra', [
      'The first song concerns a queen who traded her crown for safe passage through a winter storm. In Cyranthian editions she regrets the ' +
        'bargain. Veyran singers generally omit that verse.',
      'The second concerns two brothers who defend opposite banks of the same river, each unaware that their commanders dine together every ' +
        'New Year. It is traditionally sung while drinking, which may explain why nobody finds the ending subtle.',
      'The final melody has acquired six sets of words since the occupation. Provincial censors approve of the version concerning spring flowers. ' +
        'Audiences somehow continue arriving with black ribbons.',
    ]);
  }
}

export const BOOK_CONSTRUCTORS = [
  NovicesFirstLightBook,
  IllustratedHistoryOfTheGreatAscentBook,
  TravelersCompanionToVeyraBook,
  SurveyNotesLanternSiteSevenBook,
  ThirtySevenUsesForTurnipsBook,
  BrassGardenerBook,
  KissBeforeTheSiegeBook,
  MillersCleverDaughterBook,
  EtiquetteOfVictoriousOfficersBook,
  SevenSuppersAtTheCrookedCrownBook,
  EmberdeepProvisionLedgerBook,
  JournalOfAdeptMarenBook,
  EmberkeepersAlmanacBook,
  ElementaryPrinciplesOfThaumicIndustryBook,
  ProvincialLanternsBestiaryBook,
  MushroomsOfTheLowerRoadsBook,
  ClockmakerAndTheMoonBook,
  BalladsOfOldVeyraBook,
] as const;

export const UNIQUE_BOOK_SAVE_IDS: ReadonlySet<string> = new Set([
  SurveyNotesLanternSiteSevenBook.saveId,
  EmberdeepProvisionLedgerBook.saveId,
  JournalOfAdeptMarenBook.saveId,
  EmberkeepersAlmanacBook.saveId,
]);

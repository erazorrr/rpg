export const statueInscriptions = {
  'forgotten-king': {
    subject: 'a king wearing a crown unlike any human work.',
    lines: ['The worn inscription is in an unknown hand: "A crown is only borrowed."'],
  },
  'sealed-depths': {
    subject: 'a robed figure holding a stone key against its chest.',
    lines: ['Only one phrase can be read: "What sleeps below must remain unnamed."'],
  },
  'nameless-warden': {
    subject: 'an armored warden bearing the later-carved flame of Cyranth.',
    lines: ['Order script reads: "Lantern Site Seven. The dark yields to flame."'],
  },
  'fallen-expedition': {
    subject: 'travelers carrying packs and water jars toward the depths.',
    lines: ['Fresh-cut Veyran letters read: "Emberdeep shelters those who find the road."'],
  },
  'ember-vigil': {
    subject: 'three hooded figures warming their hands around a carved flame.',
    lines: ['Old letters spiral around the base: "We kept the ember. It kept us."'],
  },
  'sealed-jar': {
    subject: 'a kneeling water bearer offering a stoppered jar.',
    lines: ['A Veyran note reads: "Leave one sealed for those who follow."'],
  },
  'refuge-count': {
    subject: 'a line of small figures passing beneath a mountain.',
    lines: ['Careful tally marks end beside the words: "Twenty-three came below. Twenty-three woke."'],
  },
  'seventh-claim': {
    subject: 'a mailed hand raised above a row of broken crowns.',
    lines: ['A chipped Cyranthian plaque reads: "By Ordered Flame, the seventh descent is claimed."'],
  },
  'marked-road': {
    subject: 'a guide holding two cords, one smooth and one knotted.',
    lines: ['Veyran letters read: "Blue marks shelter. Red marks no return."'],
  },
  'stone-workers': {
    subject: 'broad, long-eared workers lifting fitted stones together.',
    lines: ['The scratched inscription repeats one word in several hands: "Home."'],
  },
  'warren-road': {
    subject: 'small, scaled workers carrying hooks, salve jars, and fitted stones into a mountain.',
    lines: ['Fresh-cut words beneath their feet read: "The road ended. The warren did not."'],
  },
  'four-shadows': {
    subject: 'a short robed figure holding one hand above four horned shadows.',
    lines: ['A Veyran tally beside it reads: "Three families arrived. Their promises arrived with them."'],
  },
  'lost-lanterns': {
    subject: 'six lantern bearers descending while two turn back.',
    lines: ['Order numerals record: "Six entered. Two ascended."'],
  },
  'empty-throne': {
    subject: 'an empty throne encircled by watchful, many-eyed beasts.',
    lines: ['The oldest marks have been struck away. No name remains.'],
  },
} as const;

export type StatueInscriptionId = keyof typeof statueInscriptions;
export const statueInscriptionIds = Object.keys(statueInscriptions) as StatueInscriptionId[];

export function isStatueInscriptionId(value: unknown): value is StatueInscriptionId {
  return typeof value === 'string' && value in statueInscriptions;
}

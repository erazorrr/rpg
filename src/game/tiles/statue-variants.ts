import {ForegroundColor} from '../../io/foreground.color';

export const statueVariants = {
  'weathered-stone': {
    description: 'A weathered stone statue depicts',
    color: ForegroundColor.Grey63,
  },
  'green-bronze': {
    description: 'A green-patinated bronze statue depicts',
    color: ForegroundColor.Olive,
  },
  'pale-marble': {
    description: 'A pale marble statue depicts',
    color: ForegroundColor.Silver,
  },
  'black-glass': {
    description: 'A black glass statue depicts',
    color: ForegroundColor.Grey37,
  },
  'fire-scarred': {
    description: 'A fire-scarred stone statue depicts',
    color: ForegroundColor.Orange4a,
  },
} as const;

export type StatueVariantId = keyof typeof statueVariants;
export const statueVariantIds = Object.keys(statueVariants) as StatueVariantId[];

export function isStatueVariantId(value: unknown): value is StatueVariantId {
  return typeof value === 'string' && value in statueVariants;
}

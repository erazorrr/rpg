export type OrderRank = 'Novice' | 'Initiate' | 'Lantern' | 'Warden' | 'Justiciar' | 'Exemplar';

export function getOrderRank(level: number): OrderRank {
  if (level >= 20) return 'Exemplar';
  if (level >= 15) return 'Justiciar';
  if (level >= 10) return 'Warden';
  if (level >= 6) return 'Lantern';
  if (level >= 3) return 'Initiate';
  return 'Novice';
}

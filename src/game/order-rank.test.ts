import {getOrderRank} from './order-rank';

describe('Order rank', () => {
  it.each([
    [1, 'Novice'], [2, 'Novice'],
    [3, 'Initiate'], [5, 'Initiate'],
    [6, 'Lantern'], [9, 'Lantern'],
    [10, 'Warden'], [14, 'Warden'],
    [15, 'Justiciar'], [19, 'Justiciar'],
    [20, 'Exemplar'], [100, 'Exemplar'],
  ])('derives the rank at level %i', (level, rank) => {
    expect(getOrderRank(level)).toBe(rank);
  });
});

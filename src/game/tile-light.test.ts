import {BackgroundColor} from '../io/background.color';
import {Position} from '../io/position';
import {sampleLight, strongestLight} from './tile-light';
import {TileLight} from './tiles/abstract.tile';

const light: TileLight = {
  radius: 3,
  innerRadius: 1,
  innerColor: BackgroundColor.Aqua,
  outerColor: BackgroundColor.Teal,
  bloodyInnerColor: BackgroundColor.Red,
  bloodyOuterColor: BackgroundColor.DarkRed1,
};

describe('tile light', () => {
  it('includes its radius boundary and excludes tiles beyond it', () => {
    expect(sampleLight(light, new Position(0, 0), new Position(3, 0), false)?.intensity).toBe(0);
    expect(sampleLight(light, new Position(0, 0), new Position(4, 0), false)).toBeUndefined();
  });

  it('chooses the strongest sample and breaks ties by position', () => {
    const weak = {source: new Position(0, 0), intensity: .2, color: BackgroundColor.Teal};
    const strong = {source: new Position(9, 9), intensity: .8, color: BackgroundColor.Aqua};
    expect(strongestLight([weak, strong])).toBe(strong);
    const tied = {...strong, source: new Position(2, 3)};
    expect(strongestLight([strong, tied])).toBe(tied);
  });
});

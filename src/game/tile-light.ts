import {BackgroundColor} from '../io/background.color';
import {Position} from '../io/position';
import {TileLight} from './tiles/abstract.tile';

export type LightSample = {
  source: Position;
  intensity: number;
  color: BackgroundColor;
};

export function sampleLight(light: TileLight, source: Position, target: Position, bloody: boolean): LightSample | undefined {
  const distance = source.distanceTo(target);
  if (distance > light.radius) return undefined;
  const inner = distance <= light.innerRadius;
  return {
    source,
    intensity: 1 - distance / light.radius,
    color: bloody
      ? inner ? light.bloodyInnerColor : light.bloodyOuterColor
      : inner ? light.innerColor : light.outerColor,
  };
}

export function strongestLight(samples: LightSample[]): LightSample | undefined {
  return samples.reduce<LightSample | undefined>((best, sample) => {
    if (!best || sample.intensity > best.intensity) return sample;
    if (sample.intensity < best.intensity) return best;
    if (sample.source.x !== best.source.x) return sample.source.x < best.source.x ? sample : best;
    return sample.source.y < best.source.y ? sample : best;
  }, undefined);
}

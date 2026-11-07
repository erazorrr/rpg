import {Char} from "../io/char";
import {Position} from "../io/position";

export interface AnimationFrame {
  frame: number;
  elapsedMs: number;
}

export type ProjectileImpact = 'hit' | 'miss' | 'neutral';

export interface ProjectilePresentation {
  path: Position[];
  projectile: Char;
  impact: ProjectileImpact;
}

export interface ProjectileEffect extends ProjectilePresentation {
  startedAtMs: number;
  travelMs: number;
  impactMs: number;
}

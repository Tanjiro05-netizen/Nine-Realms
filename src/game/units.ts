// Runtime unit instances (a placed/benched copy of a UnitDef) with star level.

import type { UnitDef } from '../data/types';
import { STAR_SCALE } from '../data/constants';

export type Star = 1 | 2 | 3;

export type UnitLoc =
  | { kind: 'bench'; index: number }
  | { kind: 'board'; col: number; row: number }
  | { kind: 'none' };

export interface UnitInstance {
  uid: string;
  def: UnitDef;
  star: Star;
  loc: UnitLoc;
}

let counter = 0;
export function makeUnit(def: UnitDef, star: Star = 1): UnitInstance {
  counter += 1;
  return { uid: `u${counter}`, def, star, loc: { kind: 'none' } };
}

/** Star scaling for HP & AD (Bible §6: ×1.8 per star). */
export function scaledStats(u: UnitInstance): { hp: number; ad: number } {
  const mult = Math.pow(STAR_SCALE, u.star - 1);
  return {
    hp: Math.round(u.def.hp * mult),
    ad: Math.round(u.def.ad * mult),
  };
}

/** Sell value: cost × 3^(star−1) (Bible §13). */
export function sellValue(u: UnitInstance): number {
  return u.def.cost * Math.pow(3, u.star - 1);
}

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

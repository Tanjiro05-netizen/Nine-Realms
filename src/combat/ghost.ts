// Scripted ghost-board opponents (Bible §20). Scales unit count, star level and
// stats by round; not a full economy sim. Enemy occupies rows 0..3.

import { ROSTER } from '../data/roster';
import { ghostUnitCount } from '../data/constants';
import { COLS, ROWS } from '../render/board';
import type { UnitDef } from '../data/types';

export interface EnemySpawn {
  def: UnitDef;
  star: number;
  col: number;
  row: number;
}

/** Per-round stat multiplier (+6%/round, Bible §20). */
export function ghostStatMult(round: number): number {
  return 1 + 0.06 * round;
}

function starForRound(round: number, rng: () => number): number {
  if (round < 4) return 1;
  if (round < 10) return 2;
  return rng() < 0.5 ? 2 : 3;
}

function costCeilingForRound(round: number): number {
  if (round < 3) return 2;
  if (round < 6) return 3;
  if (round < 10) return 4;
  return 5;
}

export function makeGhostBoard(round: number, rng: () => number = Math.random): EnemySpawn[] {
  const count = ghostUnitCount(round);
  const ceiling = costCeilingForRound(round);
  const pool = ROSTER.filter((u) => u.cost <= ceiling);
  const enemyRows = Array.from({ length: ROWS / 2 }, (_, i) => i); // 0..3
  const spawns: EnemySpawn[] = [];

  // spread across front rows first (row 3 is nearest the midline)
  const order: Array<[number, number]> = [];
  for (let r = enemyRows.length - 1; r >= 0; r--) {
    for (let c = 1; c < COLS - 1; c++) order.push([c, r]);
  }

  for (let i = 0; i < count && i < order.length; i++) {
    const def = pool[Math.floor(rng() * pool.length)];
    const [col, row] = order[i];
    spawns.push({ def, star: starForRound(round, rng), col, row });
  }
  return spawns;
}

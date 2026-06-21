// Constants & formulas — single source of truth (Handoff PDF §12, Bible §5/§6/§8/§11/§13/§14/§15/§20/§21).
// Deliberately plain numbers so they are easy to retune.

import type { Element } from './types';

/** Element display colors (Bible §23). */
export const ELEMENT_COLOR: Record<Element, number> = {
  metal: 0xe8c068, // gold
  wood: 0x4fbf6a, // green
  water: 0x46a8e6, // blue
  fire: 0xff5a3a, // red
  earth: 0xe09a3a, // orange
};

/** Pool copies available per cost tier (Bible §5). */
export const POOL_COPIES: Record<number, number> = {
  1: 18,
  2: 15,
  3: 12,
  4: 9,
  5: 7,
};

/** Star scaling multiplier per star step (Bible §6). */
export const STAR_SCALE = 1.8;

/** Economy (Bible §13). */
export const ECONOMY = {
  baseIncome: 5,
  interestPer: 10,
  interestCap: 5,
  rerollCost: 2,
  xpBuyCost: 4,
  xpBuyAmount: 4,
  freeXpPerRound: 2,
  shopSlots: 5,
} as const;

/** Win/loss streak gold bonus by streak length (Bible §13). */
export function streakGold(streak: number): number {
  if (streak >= 4) return 3;
  if (streak === 3) return 2;
  if (streak === 2) return 1;
  return 0;
}

/** Shop level odds: % chance per slot to roll each cost (Bible §14). */
export const LEVEL_ODDS: Record<number, [number, number, number, number, number]> = {
  1: [100, 0, 0, 0, 0],
  2: [75, 25, 0, 0, 0],
  3: [60, 30, 10, 0, 0],
  4: [45, 33, 20, 2, 0],
  5: [30, 40, 25, 5, 0],
  6: [22, 35, 30, 10, 3],
  7: [16, 30, 33, 17, 4],
  8: [10, 22, 32, 26, 10],
  9: [5, 15, 30, 30, 20],
};

/** XP required to advance from level N to N+1 (Bible §15). */
export const XP_TO_NEXT: Record<number, number> = {
  2: 6,
  3: 10,
  4: 20,
  5: 36,
  6: 48,
  7: 66,
  8: 84,
};

export const LEVEL_CAP = 9;

/** Combat fundamentals (Bible §8/§11). */
export const COMBAT = {
  moveSpeed: 2.6, // units/s
  manaOnAttack: 10,
  manaOnHit: 4,
  critChance: 0.25,
  critMult: 1.8,
  fightCapSeconds: 30,
  tickHz: 30, // fixed timestep
} as const;

/** Physical damage mitigation by armor (Bible §11). */
export function physicalDamage(raw: number, armor: number): number {
  return (raw * 100) / (100 + armor);
}

/** Player/enemy starting HP (Bible §21). */
export const START_HP = 100;

/** Damage to player on a loss (Bible §21). */
export function lossDamage(round: number, survivingEnemies: number): number {
  return 2 + round + survivingEnemies * 2;
}

/** Damage to enemy commander on a win (Bible §21). */
export function winDamage(round: number, survivingAllies: number): number {
  return 3 + round * 0.8 + survivingAllies * 1.5;
}

/** Ghost-board enemy unit count for a given round (Bible §20). */
export function ghostUnitCount(round: number): number {
  return Math.min(8, 1 + Math.floor(round * 0.9));
}

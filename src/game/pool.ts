// Shared unit pool (Bible §5/§14). Buying removes copies so contested units
// dry up — this is what makes rerolling for 3★ meaningful.

import { ROSTER, UNIT_BY_ID } from '../data/roster';
import { POOL_COPIES, LEVEL_ODDS } from '../data/constants';
import type { UnitDef } from '../data/types';

export class Pool {
  /** remaining copies per unit id. */
  private copies = new Map<string, number>();
  private byCost = new Map<number, string[]>();

  constructor() {
    for (const u of ROSTER) {
      this.copies.set(u.id, POOL_COPIES[u.cost]);
      const list = this.byCost.get(u.cost) ?? [];
      list.push(u.id);
      this.byCost.set(u.cost, list);
    }
  }

  remaining(id: string): number {
    return this.copies.get(id) ?? 0;
  }

  /** Take one copy of a unit out of the pool. Returns false if none left. */
  take(id: string): boolean {
    const n = this.copies.get(id) ?? 0;
    if (n <= 0) return false;
    this.copies.set(id, n - 1);
    return true;
  }

  /** Return copies to the pool (on sell). */
  give(id: string, n = 1): void {
    this.copies.set(id, (this.copies.get(id) ?? 0) + n);
  }

  /** Roll one shop slot for the given player level. May return null (empty). */
  rollSlot(level: number, rng: () => number = Math.random): UnitDef | null {
    const odds = LEVEL_ODDS[Math.min(level, 9)] ?? LEVEL_ODDS[1];
    const r = rng() * 100;
    let acc = 0;
    let cost = 1;
    for (let i = 0; i < odds.length; i++) {
      acc += odds[i];
      if (r <= acc) {
        cost = i + 1;
        break;
      }
    }
    // Weighted pick among units of that cost by remaining copies.
    const ids = this.byCost.get(cost) ?? [];
    const weighted: string[] = [];
    let total = 0;
    for (const id of ids) {
      const c = this.remaining(id);
      total += c;
      if (c > 0) weighted.push(id);
    }
    if (total === 0 || weighted.length === 0) return null;
    let pick = rng() * total;
    for (const id of weighted) {
      pick -= this.remaining(id);
      if (pick <= 0) return UNIT_BY_ID[id];
    }
    return UNIT_BY_ID[weighted[weighted.length - 1]];
  }

  rollShop(level: number, slots: number, rng: () => number = Math.random): (UnitDef | null)[] {
    return Array.from({ length: slots }, () => this.rollSlot(level, rng));
  }
}

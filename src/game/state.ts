// Central game state + mutations (plan phase). Emits 'change' so the HUD and
// 3D unit view stay in sync. Economy/leveling per Bible §13/§15.

import type { UnitDef } from '../data/types';
import {
  ECONOMY,
  XP_TO_NEXT,
  LEVEL_CAP,
  streakGold,
  winDamage,
  lossDamage,
} from '../data/constants';
import { ROWS, COLS } from '../render/board';
import { Pool } from './pool';
import {
  makeUnit,
  sellValue,
  cellKey,
  type UnitInstance,
  type UnitLoc,
  type Star,
} from './units';

export const BENCH_SIZE = 9;

type Listener = () => void;

export class GameState {
  gold = 24;
  level = 3;
  xp = 0;
  round = 1;
  hp = 100;
  enemyHp = 100;
  phase: 'plan' | 'combat' = 'plan';
  winStreak = 0;
  lossStreak = 0;
  lastResult: 'win' | 'loss' | 'draw' | null = null;

  pool = new Pool();
  shop: (UnitDef | null)[] = [];
  shopFrozen = false;

  bench: (UnitInstance | null)[] = Array(BENCH_SIZE).fill(null);
  board = new Map<string, UnitInstance>();

  selectedUid: string | null = null;

  private listeners: Listener[] = [];

  constructor() {
    this.shop = this.pool.rollShop(this.level, ECONOMY.shopSlots);
  }

  onChange(cb: Listener): void {
    this.listeners.push(cb);
  }
  private emit(): void {
    for (const cb of this.listeners) cb();
  }

  // ---- queries ----
  boardCount(): number {
    return this.board.size;
  }
  xpToNext(): number {
    return XP_TO_NEXT[this.level] ?? Infinity;
  }
  allUnits(): UnitInstance[] {
    return [
      ...this.board.values(),
      ...this.bench.filter((u): u is UnitInstance => u !== null),
    ];
  }
  boardUnits(): UnitInstance[] {
    return [...this.board.values()];
  }
  unitById(uid: string): UnitInstance | null {
    return this.allUnits().find((u) => u.uid === uid) ?? null;
  }

  // ---- economy ----
  reroll(): boolean {
    if (this.phase !== 'plan') return false;
    if (this.gold < ECONOMY.rerollCost) return false;
    this.gold -= ECONOMY.rerollCost;
    this.shop = this.pool.rollShop(this.level, ECONOMY.shopSlots);
    this.emit();
    return true;
  }

  buyXP(): boolean {
    if (this.phase !== 'plan') return false;
    if (this.level >= LEVEL_CAP) return false;
    if (this.gold < ECONOMY.xpBuyCost) return false;
    this.gold -= ECONOMY.xpBuyCost;
    this.addXP(ECONOMY.xpBuyAmount);
    this.emit();
    return true;
  }

  private addXP(amount: number): void {
    this.xp += amount;
    while (this.level < LEVEL_CAP && this.xp >= this.xpToNext()) {
      this.xp -= this.xpToNext();
      this.level += 1;
    }
    if (this.level >= LEVEL_CAP) this.xp = 0;
  }

  toggleFreeze(): void {
    this.shopFrozen = !this.shopFrozen;
    this.emit();
  }

  // ---- combat lifecycle ----
  beginCombat(): boolean {
    if (this.phase !== 'plan' || this.boardCount() === 0) return false;
    this.phase = 'combat';
    this.selectedUid = null;
    this.emit();
    return true;
  }

  /** Apply a fight result, award income, advance the round, and reroll. */
  resolveCombat(result: 'win' | 'loss' | 'draw', allySurvivors: number, enemySurvivors: number): void {
    this.lastResult = result === 'loss' ? 'loss' : result;
    if (result === 'win') {
      this.enemyHp = Math.max(0, this.enemyHp - Math.round(winDamage(this.round, allySurvivors)));
      this.winStreak += 1;
      this.lossStreak = 0;
    } else if (result === 'loss') {
      this.hp = Math.max(0, this.hp - Math.round(lossDamage(this.round, enemySurvivors)));
      this.lossStreak += 1;
      this.winStreak = 0;
    }

    // income: base + interest + streak (Bible §13)
    const interest = Math.min(ECONOMY.interestCap, Math.floor(this.gold / ECONOMY.interestPer));
    const streak = streakGold(Math.max(this.winStreak, this.lossStreak));
    this.gold += ECONOMY.baseIncome + interest + streak;
    this.addXP(ECONOMY.freeXpPerRound);

    this.round += 1;
    if (!this.shopFrozen) this.shop = this.pool.rollShop(this.level, ECONOMY.shopSlots);
    this.phase = 'plan';
    this.emit();
  }

  isGameOver(): boolean {
    return this.hp <= 0 || this.enemyHp <= 0;
  }

  // ---- shop / units ----
  private firstFreeBench(): number {
    return this.bench.findIndex((s) => s === null);
  }

  buyFromShop(slot: number): boolean {
    if (this.phase !== 'plan') return false;
    const def = this.shop[slot];
    if (!def) return false;
    if (this.gold < def.cost) return false;
    const benchIdx = this.firstFreeBench();
    if (benchIdx < 0) return false; // bench full
    if (!this.pool.take(def.id)) return false;
    this.gold -= def.cost;
    this.shop[slot] = null;
    const unit = makeUnit(def, 1);
    this.placeAtBench(unit, benchIdx);
    this.tryCombine(def.id);
    this.emit();
    return true;
  }

  sellSelected(): boolean {
    if (!this.selectedUid) return false;
    return this.sell(this.selectedUid);
  }

  sell(uid: string): boolean {
    if (this.phase !== 'plan') return false;
    const unit = this.unitById(uid);
    if (!unit) return false;
    this.gold += sellValue(unit);
    // return all copies represented by this star to the pool.
    this.pool.give(unit.def.id, Math.pow(3, unit.star - 1));
    this.clearSlot(unit.loc);
    if (this.selectedUid === uid) this.selectedUid = null;
    this.emit();
    return true;
  }

  // ---- placement ----
  select(uid: string | null): void {
    this.selectedUid = uid;
    this.emit();
  }

  unitAt(loc: UnitLoc): UnitInstance | null {
    if (loc.kind === 'bench') return this.bench[loc.index];
    if (loc.kind === 'board') return this.board.get(cellKey(loc.col, loc.row)) ?? null;
    return null;
  }

  private placeAtBench(unit: UnitInstance, index: number): void {
    this.bench[index] = unit;
    unit.loc = { kind: 'bench', index };
  }
  private clearSlot(loc: UnitLoc): void {
    if (loc.kind === 'bench') this.bench[loc.index] = null;
    else if (loc.kind === 'board') this.board.delete(cellKey(loc.col, loc.row));
  }
  private setSlot(loc: UnitLoc, unit: UnitInstance): void {
    if (loc.kind === 'bench') {
      this.bench[loc.index] = unit;
    } else if (loc.kind === 'board') {
      this.board.set(cellKey(loc.col, loc.row), unit);
    }
    unit.loc = loc;
  }

  isPlayerRow(row: number): boolean {
    return row >= ROWS / 2 && row < ROWS;
  }

  /** Move a unit to a destination, swapping with any occupant. Returns true on success. */
  moveUnit(uid: string, dest: UnitLoc): boolean {
    if (this.phase !== 'plan') return false;
    const unit = this.unitById(uid);
    if (!unit) return false;
    if (dest.kind === 'board') {
      if (!this.isPlayerRow(dest.row) || dest.col < 0 || dest.col >= COLS) return false;
    }
    if (dest.kind === 'bench' && (dest.index < 0 || dest.index >= BENCH_SIZE)) return false;

    const from = unit.loc;
    const occupant = this.unitAt(dest);
    if (occupant && occupant.uid === uid) return false;

    // Board cap: adding a NEW unit onto the board (no swap partner) must respect level.
    const comingOntoBoard = dest.kind === 'board' && from.kind !== 'board';
    if (comingOntoBoard && !occupant && this.boardCount() >= this.level) return false;

    this.clearSlot(from);
    if (occupant) this.clearSlot(dest);
    this.setSlot(dest, unit);
    if (occupant) this.setSlot(from, occupant);
    this.emit();
    return true;
  }

  /** Combine three matching id+star units into one of the next star (recursive). */
  tryCombine(defId: string): void {
    for (let star: Star = 1; star < 3; star = (star + 1) as Star) {
      const group = this.allUnits().filter((u) => u.def.id === defId && u.star === star);
      if (group.length >= 3) {
        // Keep the one in the "best" slot (prefer board, else first), upgrade it.
        group.sort((a, b) => (a.loc.kind === 'board' ? -1 : 1) - (b.loc.kind === 'board' ? -1 : 1));
        const keep = group[0];
        const consume = group.slice(1, 3);
        for (const c of consume) this.clearSlot(c.loc);
        keep.star = (keep.star + 1) as Star;
        // recurse to allow 3x2★ -> 3★ chains
        this.tryCombine(defId);
        return;
      }
    }
  }
}

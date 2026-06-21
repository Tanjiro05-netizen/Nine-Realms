// Fixed-timestep auto-combat (Bible §8/§9/§10/§11). Real-time ticks; nearest-
// target with phantom backline-jump; mana on attack/hit; cast at full mana;
// crits; physical/magic/true damage; the 5 MVP statuses; 6 ability templates.

import { COMBAT, physicalDamage } from '../data/constants';
import { HEX_W } from '../render/board';
import { type Combatant, effectiveArmor } from './combatant';

export type CombatResult = 'player' | 'enemy' | 'draw';

export interface DamageEvent {
  kind: 'dmg';
  x: number;
  z: number;
  amount: number;
  crit: boolean;
  dtype: 'physical' | 'magic' | 'true';
  team: Combatant['team'];
}
export interface CastEvent {
  kind: 'cast';
  x: number;
  z: number;
  color: number;
  template: string;
}
export type CombatEvent = DamageEvent | CastEvent;

const UNIT_RADIUS = 0.55;

function dist(a: Combatant, b: Combatant): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
function attackRangeWorld(c: Combatant): number {
  return c.range * HEX_W + UNIT_RADIUS;
}

export class Combat {
  time = 0;
  finished = false;
  result: CombatResult | null = null;
  events: CombatEvent[] = [];
  private acc = 0;
  private readonly step = 1 / COMBAT.tickHz;

  constructor(public units: Combatant[]) {}

  private enemiesOf(c: Combatant): Combatant[] {
    return this.units.filter((u) => u.alive && u.team !== c.team);
  }
  private alliesOf(c: Combatant): Combatant[] {
    return this.units.filter((u) => u.alive && u.team === c.team && u !== c);
  }
  private nearest(c: Combatant, list: Combatant[]): Combatant | null {
    let best: Combatant | null = null;
    let bd = Infinity;
    for (const o of list) {
      const d = dist(c, o);
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  private byId(id: string | null): Combatant | null {
    if (!id) return null;
    const c = this.units.find((u) => u.uid === id);
    return c && c.alive ? c : null;
  }

  /** Advance by real dt, running as many fixed steps as needed. */
  advance(dt: number): void {
    if (this.finished) return;
    this.acc += Math.min(dt, 0.25);
    while (this.acc >= this.step) {
      this.tick(this.step);
      this.acc -= this.step;
      if (this.finished) break;
    }
  }

  private tick(dt: number): void {
    this.time += dt;
    for (const c of this.units) {
      if (!c.alive) continue;
      this.tickStatuses(c, dt);
      if (!c.alive) continue;
      if (c.stunT > 0) continue;

      // acquire/retain target
      let target = this.byId(c.target);
      if (!target) {
        target = this.nearest(c, this.enemiesOf(c));
        c.target = target?.uid ?? null;
      }
      if (!target) continue;

      const d = dist(c, target);
      const inRange = d <= attackRangeWorld(c);

      // cast at full mana before/instead of attacking
      if (c.mana >= c.manaMax) {
        this.cast(c, target);
        continue;
      }

      if (inRange) {
        c.attackCd -= dt;
        if (c.attackCd <= 0) {
          this.basicAttack(c, target);
          c.attackCd = 1 / Math.max(0.1, c.as);
        }
      } else if (c.rootT <= 0) {
        this.moveToward(c, target, dt);
      }
    }

    this.checkEnd();
  }

  private tickStatuses(c: Combatant, dt: number): void {
    if (c.regenPct > 0 && c.hp < c.maxHp) {
      c.hp = Math.min(c.maxHp, c.hp + c.regenPct * c.maxHp * dt);
    }
    if (c.hotT > 0) {
      c.hp = Math.min(c.maxHp, c.hp + c.hotPerSec * dt);
      c.hotT -= dt;
    }
    if (c.burnT > 0) {
      this.applyDamage(c, c.burnDps * dt, 'true', null, false, false);
      c.burnT -= dt;
    }
    c.stunT = Math.max(0, c.stunT - dt);
    c.rootT = Math.max(0, c.rootT - dt);
    c.armorBreakT = Math.max(0, c.armorBreakT - dt);
  }

  private moveToward(c: Combatant, target: Combatant, dt: number): void {
    const dx = target.x - c.x;
    const dz = target.z - c.z;
    const len = Math.hypot(dx, dz) || 1;
    const v = COMBAT.moveSpeed * dt;
    c.x += (dx / len) * v;
    c.z += (dz / len) * v;
  }

  private rollCrit(c: Combatant): boolean {
    if (c.critFirst && !c.firstAttackDone) return true;
    return Math.random() < COMBAT.critChance;
  }

  private basicAttack(c: Combatant, target: Combatant): void {
    const crit = this.rollCrit(c);
    c.firstAttackDone = true;
    const raw = c.ad * (crit ? COMBAT.critMult : 1);
    this.applyDamage(target, raw, 'physical', c, crit, true);

    // Metal shred on hit
    if (c.armorShredPct > 0) {
      target.armorBreakPct = Math.max(target.armorBreakPct, c.armorShredPct);
      target.armorBreakT = 2.5;
    }
    // Fire burn on hit
    if (c.burnOnHit) this.applyBurn(target, c.ad * 0.35, 3);

    // Panda cleave to one neighbour of the target
    if (c.cleavePct > 0) {
      const neighbour = this.enemiesOf(c).find((e) => e !== target && dist(e, target) < HEX_W * 1.2);
      if (neighbour) this.applyDamage(neighbour, raw * c.cleavePct, 'physical', c, false, false);
    }

    c.mana = Math.min(c.manaMax, c.mana + COMBAT.manaOnAttack);
  }

  private cast(c: Combatant, target: Combatant): void {
    const free = c.freeCastAvailable;
    c.freeCastAvailable = false;
    c.mana = free ? c.mana : 0;
    this.events.push({ kind: 'cast', x: c.x, z: c.z, color: c.def.model.tint ?? 0xffffff, template: c.def.ability.template });

    this.runAbility(c, target);
    if (c.echoPct > 0) this.runAbility(c, target, c.echoPct);
  }

  private runAbility(c: Combatant, target: Combatant, scale = 1): void {
    const ap = c.apMult * scale;
    switch (c.def.ability.template) {
      case 'nuke': {
        const t = this.lowestHp(this.enemiesOf(c)) ?? target;
        this.applyDamage(t, c.ad * 3.0 * ap, 'magic', c, false, false);
        break;
      }
      case 'aoe': {
        const center = target;
        for (const e of this.enemiesOf(c)) {
          if (dist(e, center) <= HEX_W * 1.6) {
            this.applyDamage(e, c.ad * 1.8 * ap, 'magic', c, false, false);
            if (c.def.element === 'fire') this.applyBurn(e, c.ad * 0.4, 3);
          }
        }
        break;
      }
      case 'shield': {
        c.shield += c.maxHp * 0.5 * ap;
        break;
      }
      case 'heal': {
        const ally = this.lowestHp([c, ...this.alliesOf(c)]) ?? c;
        ally.hp = Math.min(ally.maxHp, ally.hp + c.ad * 2.5 * ap);
        for (const a of [c, ...this.alliesOf(c)]) {
          if (dist(a, c) <= HEX_W * 2) {
            a.hotPerSec = c.ad * 0.6 * ap;
            a.hotT = 3;
          }
        }
        break;
      }
      case 'dash': {
        const backline = this.farthest(c, this.enemiesOf(c)) ?? target;
        c.x = backline.x + (c.team === 'player' ? -0.1 : 0.1);
        c.z = backline.z + (c.team === 'player' ? 0.8 : -0.8);
        c.target = backline.uid;
        this.applyDamage(backline, c.ad * 2.2 * ap, 'magic', c, true, false);
        break;
      }
      case 'control': {
        this.applyDamage(target, c.ad * 1.5 * ap, 'magic', c, false, false);
        target.stunT = Math.max(target.stunT, 1.5);
        target.armorBreakPct = Math.max(target.armorBreakPct, 0.2);
        target.armorBreakT = 3;
        break;
      }
    }
  }

  private applyBurn(target: Combatant, dps: number, dur: number): void {
    target.burnDps = Math.max(target.burnDps, dps);
    target.burnT = Math.max(target.burnT, dur);
  }

  private applyDamage(
    target: Combatant,
    raw: number,
    dtype: DamageEvent['dtype'],
    source: Combatant | null,
    crit: boolean,
    isBasic: boolean,
  ): void {
    if (!target.alive) return;
    let amount = raw;
    if (dtype === 'physical') amount = physicalDamage(raw, effectiveArmor(target));
    amount = Math.max(0, Math.round(amount));

    let remaining = amount;
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, remaining);
      target.shield -= absorbed;
      remaining -= absorbed;
    }
    target.hp -= remaining;

    if (isBasic) target.mana = Math.min(target.manaMax, target.mana + COMBAT.manaOnHit);
    void source;

    this.events.push({ kind: 'dmg', x: target.x, z: target.z, amount, crit, dtype, team: target.team });

    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
    }
  }

  private lowestHp(list: Combatant[]): Combatant | null {
    let best: Combatant | null = null;
    for (const c of list) {
      if (!c.alive) continue;
      if (!best || c.hp / c.maxHp < best.hp / best.maxHp) best = c;
    }
    return best;
  }
  private farthest(c: Combatant, list: Combatant[]): Combatant | null {
    let best: Combatant | null = null;
    let bd = -1;
    for (const o of list) {
      const d = dist(c, o);
      if (d > bd) {
        bd = d;
        best = o;
      }
    }
    return best;
  }

  private checkEnd(): void {
    const playerAlive = this.units.some((u) => u.alive && u.team === 'player');
    const enemyAlive = this.units.some((u) => u.alive && u.team === 'enemy');
    if (!playerAlive || !enemyAlive) {
      this.finished = true;
      this.result = playerAlive && !enemyAlive ? 'player' : !playerAlive && enemyAlive ? 'enemy' : 'draw';
      return;
    }
    if (this.time >= COMBAT.fightCapSeconds) {
      this.finished = true;
      this.result = this.resolveByAttrition();
    }
  }

  private resolveByAttrition(): CombatResult {
    const count = (team: Combatant['team']) => this.units.filter((u) => u.alive && u.team === team).length;
    const p = count('player');
    const e = count('enemy');
    if (p !== e) return p > e ? 'player' : 'enemy';
    const hpPct = (team: Combatant['team']) =>
      this.units.filter((u) => u.team === team).reduce((s, u) => s + u.hp / u.maxHp, 0);
    return hpPct('player') >= hpPct('enemy') ? 'player' : 'enemy';
  }

  survivors(team: Combatant['team']): number {
    return this.units.filter((u) => u.alive && u.team === team).length;
  }
}

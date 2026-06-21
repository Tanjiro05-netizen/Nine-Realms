// A live combat unit: a snapshot of a UnitDef+star with stats, position and
// status timers. Statuses use countdown seconds (decremented each tick).

import type { UnitDef } from '../data/types';
import { STAR_SCALE } from '../data/constants';
import type { TeamBonuses } from './bonuses';

export type Team = 'player' | 'enemy';

export interface Combatant {
  uid: string;
  team: Team;
  def: UnitDef;
  star: number;

  maxHp: number;
  hp: number;
  baseArmor: number;
  ad: number;
  apMult: number; // ability power multiplier (1 + bonuses)
  as: number; // attacks/sec
  range: number; // in hexes
  manaMax: number;
  mana: number;

  x: number;
  z: number;

  alive: boolean;
  attackCd: number; // seconds to next attack
  target: string | null;

  shield: number;

  // status timers (seconds remaining)
  stunT: number;
  rootT: number;
  armorBreakT: number;
  armorBreakPct: number;
  burnT: number;
  burnDps: number;
  hotT: number;
  hotPerSec: number;

  // flags / carried bonuses
  firstAttackDone: boolean;
  freeCastAvailable: boolean;
  cleavePct: number;
  echoPct: number;
  regenPct: number;
  burnOnHit: boolean;
  critFirst: boolean;
  armorShredPct: number;
  manaReduce: number;
}

export function makeCombatant(
  uid: string,
  team: Team,
  def: UnitDef,
  star: number,
  x: number,
  z: number,
  bonuses: TeamBonuses,
  isFrontRow: boolean,
): Combatant {
  const starMult = Math.pow(STAR_SCALE, star - 1);
  const maxHp = Math.round(def.hp * starMult);
  const startShield =
    maxHp * (bonuses.startShieldPct + (isFrontRow ? bonuses.frontShieldPct : 0));
  return {
    uid,
    team,
    def,
    star,
    maxHp,
    hp: maxHp,
    baseArmor: def.armor + (isFrontRow ? bonuses.frontArmorAdd : 0),
    ad: Math.round(def.ad * starMult * (1 + bonuses.adMult)),
    apMult: 1 + bonuses.apBonus,
    as: def.as * (1 + bonuses.asMult),
    range: def.range,
    manaMax: def.mana,
    mana: Math.min(def.mana, bonuses.manaStart),
    x,
    z,
    alive: true,
    attackCd: 1 / Math.max(0.1, def.as * (1 + bonuses.asMult)),
    target: null,
    shield: startShield,
    stunT: 0,
    rootT: 0,
    armorBreakT: 0,
    armorBreakPct: 0,
    burnT: 0,
    burnDps: 0,
    hotT: 0,
    hotPerSec: 0,
    firstAttackDone: false,
    freeCastAvailable: bonuses.firstCastFree,
    cleavePct: bonuses.cleavePct,
    echoPct: bonuses.echoPct,
    regenPct: bonuses.regenPctPerSec,
    burnOnHit: bonuses.burnOnHit,
    critFirst: bonuses.critFirst,
    armorShredPct: bonuses.armorShredPct,
    manaReduce: bonuses.abilityManaReduce,
  };
}

/** Effective armor after armor-break status. */
export function effectiveArmor(c: Combatant): number {
  const pct = c.armorBreakT > 0 ? c.armorBreakPct : 0;
  return c.baseArmor * (1 - pct);
}

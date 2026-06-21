// Team combat bonuses derived from the 7 traits, applied at combat start
// (Bible §12). Each element/bloodline contributes its highest ACTIVE tier
// (breakpoints are absolute, not cumulative).

import type { UnitDef } from '../data/types';
import { computeTraits } from '../data/traits';

export interface TeamBonuses {
  adMult: number; // additive fraction -> (1 + adMult)
  asMult: number;
  apBonus: number; // additive fraction to ability power
  manaStart: number;
  armorShredPct: number; // applied to enemies on attack
  regenPctPerSec: number; // % max HP / s
  startShieldPct: number; // % max HP shield at start
  abilityManaReduce: number; // flat mana cost reduction
  burnOnHit: boolean;
  frontArmorAdd: number; // front two rows
  frontShieldPct: number; // front two rows, % max HP
  critFirst: boolean; // first attack guaranteed crit
  cleavePct: number; // basic attack cleave to neighbor
  echoPct: number; // abilities echo for a fraction
  firstCastFree: boolean;
}

export function emptyBonuses(): TeamBonuses {
  return {
    adMult: 0, asMult: 0, apBonus: 0, manaStart: 0, armorShredPct: 0,
    regenPctPerSec: 0, startShieldPct: 0, abilityManaReduce: 0, burnOnHit: false,
    frontArmorAdd: 0, frontShieldPct: 0, critFirst: false, cleavePct: 0,
    echoPct: 0, firstCastFree: false,
  };
}

export function deriveBonuses(defs: UnitDef[]): TeamBonuses {
  const b = emptyBonuses();
  for (const t of computeTraits(defs)) {
    const i = t.activeTierIndex;
    if (i < 0) continue;
    switch (t.def.id) {
      case 'panda':
        b.adMult = [0.15, 0.35, 0.6][i];
        b.asMult = [0.08, 0.15, 0.25][i];
        b.cleavePct = [0, 0.25, 0.5][i];
        if (i >= 2) b.critFirst = true;
        break;
      case 'loong':
        b.manaStart = [20, 20, 20][i];
        b.apBonus += [0.2, 0.5, 0.9][i];
        b.echoPct = [0, 0.25, 0.25][i];
        break;
      case 'metal':
        b.armorShredPct = [0.15, 0.3][i] ?? 0.3;
        break;
      case 'wood':
        b.regenPctPerSec = [0.02, 0.04][i] ?? 0.04;
        if (i >= 1) b.startShieldPct += 0.15;
        break;
      case 'water':
        b.apBonus += [0.25, 0.5][i] ?? 0.5;
        b.abilityManaReduce = 10;
        if (i >= 1) b.firstCastFree = true;
        break;
      case 'fire':
        b.burnOnHit = true;
        break;
      case 'earth':
        b.frontArmorAdd = 20;
        b.frontShieldPct = 0.12;
        break;
    }
  }
  return b;
}

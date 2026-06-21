// The 7 traits — 2 Bloodlines + 5 Elements (Bible §12, PDF §17).
// Counts are over DISTINCT units fielded.

import type { Bloodline, Element, TraitDef, UnitDef } from './types';
import { ELEMENT_COLOR } from './constants';

export const BLOODLINE_TRAITS: TraitDef[] = [
  {
    id: 'panda',
    kind: 'bloodline',
    name: 'Panda · Eighteen Arms',
    nameZh: '熊猫',
    color: 0xf2e9d8,
    tiers: [
      { count: 3, label: 'Brawl', bonus: '+15% AD, +8% AS.' },
      { count: 6, label: 'War', bonus: '+35% AD, +15% AS; attacks cleave 25% to one adjacent enemy.' },
      { count: 9, label: 'Legend', bonus: '+60% AD, +25% AS; first attack each fight is a guaranteed crit; cleave 50%.' },
    ],
  },
  {
    id: 'loong',
    kind: 'bloodline',
    name: 'Loong · Nine Sons',
    nameZh: '应龙',
    color: 0x46e6cf,
    tiers: [
      { count: 3, label: 'Spark', bonus: '+20 starting mana, +20% ability power.' },
      { count: 6, label: 'Storm', bonus: '+50% ability power; abilities echo for 25% a second time.' },
      { count: 9, label: 'Heaven', bonus: '+90% ability power; first ult each fight casts twice; rolling Elemental Storm.' },
    ],
  },
];

export const ELEMENT_TRAITS: TraitDef[] = [
  {
    id: 'metal',
    kind: 'element',
    name: 'Metal',
    nameZh: '金',
    color: ELEMENT_COLOR.metal,
    tiers: [
      { count: 2, label: 'Shred', bonus: 'Attacks apply −15% Armor.' },
      { count: 4, label: 'Rend', bonus: 'Shred −30% and refund 8 mana on shredded kills.' },
    ],
  },
  {
    id: 'wood',
    kind: 'element',
    name: 'Wood',
    nameZh: '木',
    color: ELEMENT_COLOR.wood,
    tiers: [
      { count: 2, label: 'Regrowth', bonus: 'Allies regen 2% max HP/s.' },
      { count: 3, label: 'Bloom', bonus: 'Regen 4%/s and start with a 15%-HP shield.' },
    ],
  },
  {
    id: 'water',
    kind: 'element',
    name: 'Water',
    nameZh: '水',
    color: ELEMENT_COLOR.water,
    tiers: [
      { count: 2, label: 'Flow', bonus: '+25% ability power; abilities cost −10 mana.' },
      { count: 4, label: 'Tide', bonus: '+50% AP; first cast each fight is free.' },
    ],
  },
  {
    id: 'fire',
    kind: 'element',
    name: 'Fire',
    nameZh: '火',
    color: ELEMENT_COLOR.fire,
    tiers: [
      { count: 2, label: 'Burn', bonus: 'Attacks/abilities apply Burn (true DoT).' },
      { count: 4, label: 'Inferno', bonus: 'Burn stacks and spreads on death.' },
    ],
  },
  {
    id: 'earth',
    kind: 'element',
    name: 'Earth',
    nameZh: '土',
    color: ELEMENT_COLOR.earth,
    tiers: [
      { count: 2, label: 'Bulwark', bonus: 'Front two rows gain +20 Armor & 12% max-HP shield.' },
      { count: 3, label: 'Mountain', bonus: 'Shield refreshes once at 50% HP.' },
    ],
  },
];

export const ALL_TRAITS: TraitDef[] = [...BLOODLINE_TRAITS, ...ELEMENT_TRAITS];

export interface ActiveTrait {
  def: TraitDef;
  count: number;
  /** index of the highest tier currently met, or -1 if none. */
  activeTierIndex: number;
}

/** Count distinct units per bloodline and element, and resolve active tiers. */
export function computeTraits(units: UnitDef[]): ActiveTrait[] {
  const seen = new Set<string>();
  const bloodlineCounts: Record<Bloodline, Set<string>> = {
    panda: new Set(),
    loong: new Set(),
  };
  const elementCounts: Record<Element, Set<string>> = {
    metal: new Set(), wood: new Set(), water: new Set(), fire: new Set(), earth: new Set(),
  };

  for (const u of units) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    bloodlineCounts[u.bloodline].add(u.id);
    elementCounts[u.element].add(u.id);
  }

  const resolve = (def: TraitDef, count: number): ActiveTrait => {
    let activeTierIndex = -1;
    def.tiers.forEach((t, i) => {
      if (count >= t.count) activeTierIndex = i;
    });
    return { def, count, activeTierIndex };
  };

  return [
    ...BLOODLINE_TRAITS.map((d) =>
      resolve(d, bloodlineCounts[d.id as Bloodline].size),
    ),
    ...ELEMENT_TRAITS.map((d) =>
      resolve(d, elementCounts[d.id as Element].size),
    ),
  ];
}

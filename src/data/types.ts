// Core data schemas for Nine Realms (per Handoff PDF §11).
// These are the canonical shapes the rest of the game is built on.

export type Bloodline = 'panda' | 'loong';

export type Element = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

export type Role =
  | 'vanguard'
  | 'blade'
  | 'ranger'
  | 'phantom'
  | 'mystic'
  | 'warden';

/** One of the six reusable ability templates (PDF §9 / Bible §9). */
export type AbilityTemplate =
  | 'nuke'
  | 'aoe'
  | 'shield'
  | 'heal'
  | 'dash'
  | 'control';

/** Status effects, MVP set (Bible §9). */
export type StatusKind =
  | 'burn'
  | 'stun'
  | 'root'
  | 'armorBreak'
  | 'shield'
  | 'hot';

export interface AbilityDef {
  name: string;
  nameZh: string;
  template: AbilityTemplate;
  manaCost: number;
  /** One-line description, kept verbatim from the design bible. */
  text: string;
}

/** A unit definition at 1★ baseline (Bible §4, PDF §16). */
export interface UnitDef {
  id: string;
  name: string;
  nameZh: string;
  /** myth domain (Loong) or weapon read (Panda) — flavor. */
  epithet: string;
  bloodline: Bloodline;
  element: Element;
  role: Role;
  cost: 1 | 2 | 3 | 4 | 5;
  /** 1★ baseline stats. */
  hp: number;
  ad: number;
  as: number;
  armor: number;
  range: number;
  mana: number;
  ability: AbilityDef;
  /** Which 3D asset to use. Pandas have their own GLB; Loong use a placeholder. */
  model: ModelRef;
}

export interface ModelRef {
  kind: 'glb' | 'loong-placeholder';
  /** path under /models for glb kind. */
  src?: string;
  /** tint used for placeholders + element glow. */
  tint?: number;
}

export type TraitKind = 'bloodline' | 'element';

export interface TraitTier {
  /** number of distinct units required. */
  count: number;
  label: string;
  /** one-line description of the bonus. */
  bonus: string;
}

export interface TraitDef {
  id: Bloodline | Element;
  kind: TraitKind;
  name: string;
  nameZh: string;
  color: number;
  tiers: TraitTier[];
}

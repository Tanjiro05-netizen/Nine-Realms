# 九州圣兽志 · NINE REALMS — Auto-Chess Content Bible (Filled)

*A complete, build-ready design fill of the Autochess Gameplay Content Bible.*
*Roster: 9 Panda weapon-masters (from your concept art) + 9 Loong spell-dragons (the Nine Sons of the Dragon, 龙生九子).*
*Working title candidates: **九州圣兵 / Nine Realms**, **龙猫九州 / Loong & Panda**, **圣兽奇谋 / Sacred Beast Gambit**. Used below: **Nine Realms**.*

---

## 0. READ THIS FIRST — My Design Recommendation

You asked whether there's a better system than "9 pandas + 9 loong, each with its own synergy." Short answer: keep the 18 units, **but do not give each unit its own synergy.** Eighteen unique synergies = eighteen traits = an unreadable board, and it violates the bible's own rule (4–6 traits for MVP). Here is the structure I recommend instead, and the rest of this document is built on it.

**The Two-Axis Grid.** Every unit carries exactly two trait tags:

1. **Bloodline (species / "Origin"):** `熊猫 Panda` or `应龙 Loong`. Two big *vertical* traits. Going wide on one species is a powerful, identity-defining payoff (a 6-Panda board is a martial wall; a 6-Loong board is a spell battery).
2. **Element (五行 / "Class"):** one of `金 Metal · 木 Wood · 水 Water · 火 Fire · 土 Earth`. **Elements are shared by both species.** A Fire Panda and a Fire Loong both light up 火 Fire. This shared axis is the *entire reason pandas and loong want to sit on the same board* — it answers your "I want this to work together" directly and mechanically.

That's **2 + 5 = 7 traits** covering all 18 units, which stays readable, yet produces dozens of emergent combinations (e.g., "double-Metal assassins" or "Fire-Loong burst behind a Panda wall").

**Why this beats 18 bespoke synergies**
- Readable: a new player learns 2 species + 5 elements in one match, not 18 trait cards.
- Flexible: the same unit supports multiple comps (its species OR its element).
- Themed: the Five Elements are the literal cosmology your art already implies (gold, fire-red, water-blue, wood-green, earth-orange), and the Nine Sons map onto elements with almost no forcing.
- Expandable: you get a free *signature deep mechanic* — the **Wuxing生克 cycle** (Generating & Overcoming) — that no other auto-battler has, and you can ship it later without redesigning anything (see §12).

**Roles are not traits.** Tank / carry / caster / etc. are *readability tags* on each unit, not synergy lines (otherwise you'd drown in trait icons). They guide positioning and shop decisions but don't grant breakpoint bonuses.

**One-line verdict:** Bloodline × Element grid + Wuxing cycle = your "somehow make it work" wish, made readable and deep. Everything below assumes this.

---

## 1. Game Identity & Player Fantasy

- **Core fantasy:** You are an **Immortal Strategist (仙策)** who commands two sacred bloodlines — the martial **Panda warriors** (masters of the eighteen weapons) and the arcane **Loong dragon-spirits** (the Nine Sons, who wield the Five Elements) — climbing the Nine Realms to dethrone the **Heavenly General (天将)**.
- **One-sentence pitch:** *Marshal weapon-pandas and spell-dragons, weave the Five Elements, and out-strategize the heavens in a cute-but-deadly Chinese-mythic auto-battler.*
- **Three design pillars:**
  1. **Readable depth** — every fight explains why you won; every trait says what it *does*, not just "+10%".
  2. **Two bloodlines, one board** — the join between martial and arcane is the strategic core.
  3. **Mythic-cute premium feel** — chibi power fantasy, imperial gold-and-jade UI, dusk-over-Shanghai skies.
- **Tone keywords:** mythic, martial, luminous, playful-fierce, imperial, xianxia.
- **Forbidden vibes:** grimdark gore; sterile sci-fi; generic Western fantasy; "spreadsheet with sprites" (numbers must be felt, not just read).
- **Player role:** commander/strategist (not a single hero).

---

## 2. Core Loop & Match Flow

**Loop:** Plan → Shop & Place → Combat → Result → Income → next round.

| Parameter | MVP value | Notes |
|---|---|---|
| Match length | ~18–22 rounds | one sitting, 12–18 min |
| Planning timer | 30 s (first round 40 s) | can end early with **开战 / Begin** |
| Combat timer | 30 s cap | tie resolved by survivors, then total remaining HP% |
| Opponents simulated | 1 escalating AI "Heavenly General" + ghost boards | single-player; see §20 |
| Win condition | reduce enemy commander HP to 0 **OR** survive to the final boss and clear it |
| Lose condition | your HP reaches 0 |
| Every-round decisions | buy, reroll, position, level, when to spend vs. save |

**The "every 10 seconds" satisfaction:** a buy that completes a 2★, an element breakpoint lighting up, a Loong ult wiping a clump, a crit number popping. At least one of these should fire each fight.

---

## 3. Board, Positioning & Spatial Strategy

- **Grid:** hex, **7 columns × 8 rows**, split 4 rows player / 4 rows enemy (mirrors your current prototype).
- **Ranges:** Melee = adjacent hex; Short = 2 hexes; Long = 3–4 hexes; Special (e.g., backline-jump) defined per unit.
- **Targeting (MVP):** nearest enemy; ranged units hold position while a target is in range; melee advance.
- **Positioning skill expressed through:** frontline/backline split, protecting the carry from Phantoms, clumping vs. spreading against AoE (Suanni/Chiwen punish clumps).
- **Terrain (later):** Shrine tiles (mana on start), Spirit-vein tiles (element damage boost), Hazard tiles (PvE telegraphs).

---

## 4. Unit Roster — Master Table (the centerpiece)

**18 units. Pandas mapped to your nine concept images; Loong are the Nine Sons.** Stats are 1★ baselines and intentionally round numbers you can tune. (AD = attack damage, AP = ability power scalar, AS = attacks/sec, HP, Armor, Mana = cast cost.)

### 🐼 PANDAS — martial weapon-masters (Bloodline: Panda)

| # | Unit (中文 / EN) | Art (your image) | Cost | Element | Role | HP | AD | AS | Armor | Range | Mana | Ability (one line) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | 翠玉枪 **Jade Spear** | teal spear panda | 1 | 木 Wood | Vanguard | 700 | 45 | 0.7 | 40 | 1 (reach) | 60 | **Vine Lunge** — thrust through the front enemy, rooting it 1s. |
| P2 | 青竹棍僧 **Bamboo Sage** | green bamboo-staff panda | 1 | 木 Wood | Warden | 650 | 38 | 0.7 | 35 | 1 | 50 | **Staff Sweep** — knock back & slow adjacent enemies; heal lowest ally. |
| P3 | 金链双截 **Goldchain** | gold nunchaku panda | 2 | 金 Metal | Phantom | 550 | 55 | 0.85 | 25 | 1 | 0→on-hit | **Whirl Chain** — every 3rd hit chains to a 2nd target (Metal shred). |
| P4 | 碧波刀客 **Bluetide Saber** | blue saber panda | 2 | 水 Water | Blade | 600 | 58 | 0.8 | 28 | 1 | 60 | **Tidal Slash** — dash to lowest-HP enemy, heal self for 30% of damage. |
| P5 | 赤羽神射 **Embershot** | red bow panda | 3 | 火 Fire | Ranger | 520 | 60 | 0.75 | 18 | 4 | 70 | **Triple Ember** — 3 burning arrows at the farthest enemy; applies Burn. |
| P6 | 熔山战锤 **Magma Maul** | orange lion-hammer panda | 3 | 土 Earth | Vanguard | 950 | 50 | 0.6 | 50 | 1 | 80 | **Quake Slam** — stun a small AoE 1.2s; gain a shield = 15% max HP. |
| P7 | 龙吞巨斧 **Dragoncleaver** | gold/black dragon-axe panda | 4 | 金 Metal | Blade | 1000 | 78 | 0.78 | 35 | 1 | 70 | **Dragon Cleave** — wide frontal cleave; armor-shred hit targets 30%. |
| P8 | 紫渊双刃 **Twilight Fang** | purple twin-daggers panda | 4 | 水 Water | Phantom | 720 | 70 | 0.95 | 22 | 1 | 50 | **Abyss Step** — leap to the enemy backline carry; next 3 hits crit. |
| P9 | 赤焰偃月 **Crimson Glaive** | red guandao panda | 5 | 火 Fire | Blade | 1050 | 85 | 0.8 | 38 | 2 (reach) | 80 | **Whirling Moon** — spinning AoE that grows with each enemy hit (Burn). |

### 🐉 LOONG — the Nine Sons, spell-dragons (Bloodline: Loong; **no weapons — magic only**)

| # | Unit (中文 / EN) | Myth domain | Cost | Element | Role | HP | AD | AS | Armor | Range | Mana | Ability (one line) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| L1 | 狴犴 **Bi'an** (Tiger of Law) | justice, prison gates | 1 | 土 Earth | Warden | 680 | 30 | 0.6 | 38 | 2 | 60 | **Shackle Decree** — chain the strongest enemy: stun 1.5s + 20% armor break. |
| L2 | 囚牛 **Qiuniu** (Music) | harmony, instruments | 2 | 木 Wood | Warden | 560 | 25 | 0.6 | 24 | 3 | 50 | **Song of Renewal** — heal-over-time aura + small AS buff to allies near it. |
| L3 | 蒲牢 **Pulao** (Bell-Roarer) | roaring, bells | 2 | 金 Metal | Mystic | 520 | 28 | 0.6 | 20 | 3 | 60 | **Thunder Toll** — sonic cone; stuns 0.8s and deals Metal magic damage. |
| L4 | 嘲风 **Chaofeng** (Roof-phoenix) | heights, daring, wind-fire | 3 | 火 Fire | Mystic | 560 | 30 | 0.65 | 22 | 3 | 70 | **Sky Dive** — swoop the backline, fire burst + knock-up on landing. |
| L5 | 负屃 **Fuxi** (Scholar) | literature, talismans | 3 | 水 Water | Warden | 540 | 26 | 0.6 | 22 | 4 | 80 | **Inkflow Talisman** — buff one ally: +ability power & mana regen (scroll). |
| L6 | 赑屃 **Bixi** (Stele-turtle) | strength, carrying steles | 4 | 土 Earth | Vanguard | 1200 | 35 | 0.5 | 60 | 1 | 90 | **Stone Stele** — plant a wall, shielding the row behind; taunt nearby foes. |
| L7 | 睚眦 **Yazi** (Blade-fury) | bloodthirst, sword hilts | 4 | 金 Metal | Phantom | 700 | 65 | 0.9 | 26 | 2 | 60 | **Vengeance Edge** — conjure 5 spectral blades that seek wounded enemies. |
| L8 | 狻猊 **Suanni** (Lion of Flame) | fire, smoke, stillness | 5 | 火 Fire | Mystic | 820 | 40 | 0.6 | 30 | 3 | 100 | **Lotus Inferno** — massive fire nova at the densest enemy clump (Burn). |
| L9 | 螭吻 **Chiwen** (Sea-swallower) | water, swallows fire | 5 | 水 Water | Mystic | 880 | 38 | 0.6 | 30 | 4 | 90 | **Deluge** — tidal wave across a row; cleanses ally Burns, douses Fire buffs. |

**Element distribution (panda + loong):** Metal 4 (P3,P7,L3,L7) · Water 4 (P4,P8,L5,L9) · Fire 4 (P5,P9,L4,L8) · Wood 3 (P1,P2,L2) · Earth 3 (P6,L1,L6). Clean breakpoints (see §12).

**Role spread:** Vanguard P1,P6,L6 · Blade P4,P7,P9 · Ranger P5 · Phantom P3,P8,L7 · Mystic L3,L4,L8,L9 · Warden P2,L1,L2,L5. Tanks, carries, casters, supports, assassins all present.

---

## 5. Cost Tiers, Rarity & Power Curve

| Cost | Count | Pool copies each | Identity |
|---|---|---|---|
| 1 | 3 (P1,P2,L1) | 18 | early frontline/utility; viable as 3★ rerolls |
| 2 | 4 (P3,P4,L2,L3) | 15 | first carries & supports |
| 3 | 4 (P5,P6,L4,L5) | 12 | comp-defining mid units |
| 4 | 4 (P7,P8,L6,L7) | 9 | power-spike carries/tanks |
| 5 | 3 (P9,L8,L9) | 7 | legendary board-changers |

Power rule of thumb: a 4-cost ≈ 2.0× a 2-cost at equal star; a 5-cost 1★ ≈ a 4-cost 2★ in impact but rarer. 5-costs are *splashable* (strong alone) but peak inside their element.

---

## 6. Star Upgrades & Combining

- **3 → 1:** three 1★ = one 2★; three 2★ = one 3★. Counts **bench + board together**.
- **Scaling:** HP & AD ×1.8 per star; ability values ×1.8; 3★ gets ×3.2 total plus a **visual upgrade** (your art supports this — add the gold/elemental glow and an extra weapon trail at 3★).
- **3★ 5-costs:** intentionally near-impossible; a "win-more" trophy moment, not a plan.
- **Feedback:** screen flash, element-colored burst, star sprites above the unit (already in prototype).

---

## 7. Roles (readability tags, not traits)

| Role | Job | In this roster |
|---|---|---|
| **Vanguard** | frontline tank, soak & control | Jade Spear, Magma Maul, Bixi |
| **Blade** | melee carry/duelist | Bluetide Saber, Dragoncleaver, Crimson Glaive |
| **Ranger** | ranged physical carry | Embershot |
| **Phantom** | assassin, reaches backline | Goldchain, Twilight Fang, Yazi |
| **Mystic** | caster / AoE burst | Pulao, Chaofeng, Suanni, Chiwen |
| **Warden** | support: heal/shield/control/buff | Bamboo Sage, Bi'an, Qiuniu, Fuxi |

Design note: Pandas skew Vanguard/Blade/Ranger/Phantom (martial); Loong skew Mystic/Warden (arcane) with a few crossovers (Yazi the assassin-dragon, Bixi the tank-dragon). That asymmetry is intentional and makes mixed boards stronger than mono boards mid-game.

---

## 8. Combat Fundamentals

- **Style:** real-time auto-combat, fixed-timestep ticks (your prototype already does this).
- **Move speed:** ~2.6 units/s; **attack** on cooldown 1/AS; **mana** gained on attack (+10) and on being hit (+small); cast at full mana; die at 0 HP.
- **Fight length target:** 12–22 s typical; 30 s hard cap.
- **Readability:** floating damage numbers, crit pops ("CRIT!"), HP+mana bars, element-colored ability VFX, shield as a white overbar.
- **Randomness policy:** only crits (25% base) and minor target-tiebreak are random. No random ability misses (the bible's warning: invisible randomness feels unfair).

---

## 9. Attacks, Abilities, Mana & Cooldowns

- **All units have mana** and exactly **one active ability** (plus the element passive from §12).
- **Mana sources:** attacking, being hit; Fuxi/Qiuniu can grant bonus regen (Loong identity).
- **Six reusable ability templates** (everything above is built from these):
  1. **Single-target nuke** (Twilight Fang execute, Yazi seek-blades)
  2. **AoE circle/cone** (Suanni nova, Pulao cone, Chiwen row)
  3. **Shield** (Magma Maul self-shield, Bixi wall)
  4. **Heal/buff** (Qiuniu aura, Fuxi talisman, Bluetide lifesteal)
  5. **Dash / backline jump** (Twilight Fang, Chaofeng dive, Bluetide dash)
  6. **Control** (Bi'an stun, Pulao stun, Jade Spear root, Magma Maul quake)
- **Status effects (MVP set):** Burn (Fire DoT), Root/Stun (control), Armor-break (Metal), Shield, Heal-over-time. Keep it to these five for readability.
- **Naming style:** 2–4 syllable martial/mythic ("Whirling Moon", "Lotus Inferno", "Shackle Decree").

---

## 10. Targeting, Movement & Threat Logic

- **Default:** nearest enemy; retarget when current target dies or after ~2 s of being unreachable.
- **Role overrides:** Phantoms (Twilight Fang, Chaofeng) open combat by jumping to the **farthest/backline** target; Vanguards body-block; Bixi/Bi'an can **taunt** to protect carries.
- **Collision:** soft separation (units push apart slightly), no hard blocking on the open platform (matches prototype).
- **Ability targeting templates:** nearest, lowest-HP%, densest-clump (for AoE), highest-AD (for control). Each ability above declares one.

---

## 11. Damage Types & Defensive Stats

- **Stats:** HP, AD, AP (ability scalar), AS, Armor, Range, Mana, Crit (25%/×1.8 base).
- **Damage types:** **Physical** (mitigated by Armor: `dmg×100/(100+armor)`), **Magic** (mitigated by future Spirit-Resist; ignores Armor for MVP), **True** (Burn ticks, executes). Two damage types are enough for MVP; add Spirit-Resist when Loong-heavy boards over-perform.
- **Shields** absorb before HP. **Healing** can be reduced by a future *Wither* (anti-heal) item.
- **Stat sources stack additively within a source, multiplicatively across sources** (trait + item + star).

---

## 12. Traits, Origins & Synergies — **the system** (Bloodline × Element + Wuxing)

This is the heart. Two trait axes, seven traits total.

### 12A. Bloodline (vertical species traits)

**熊猫 Panda — "Eighteen Arms" (martial)**
Counts distinct Panda units fielded.
| Tier | Units | Bonus |
|---|---|---|
| 3 | Brawl | Pandas gain +15% AD and +8% AS. |
| 6 | War | +35% AD, +15% AS; basic attacks cleave 25% to one adjacent enemy. |
| 9 | Legend | +60% AD, +25% AS; first attack each fight is a guaranteed crit; cleave → 50%. |

**应龙 Loong — "Nine Sons" (arcane)**
Counts distinct Loong units fielded.
| Tier | Units | Bonus |
|---|---|---|
| 3 | Spark | Loong start with +20 mana and gain +20% ability power. |
| 6 | Storm | +50% ability power; abilities **echo** for 25% a second time. |
| 9 | Heaven | +90% ability power; the first ult each fight casts twice; team gains a rolling **Elemental Storm** that ticks AoE true damage. |

> Design intent: 9-of-a-species is a real, climactic vertical payoff (you'll see whole-board glows). But because Pandas lean physical/frontline and Loong lean magic/backline, **a mixed board is stronger than a mono board until very late** — which keeps the element axis relevant.

### 12B. Element (horizontal "Class" — the panda↔loong glue)

Counts distinct units of that element (any bloodline). Breakpoints: **2 / (3 or 4)** depending on pool size.

| Element | Units (pool) | Tier 1 (2 units) | Tier 2 |
|---|---|---|---|
| **金 Metal** | P3,P7,L3,L7 (4) | attacks apply **−15% Armor** (Metal shred) | **(4)** shred −30% and refund 8 mana on shredded kills |
| **木 Wood** | P1,P2,L2 (3) | allies regen **2% max HP/s** | **(3)** regen 4%/s and start with a 15%-HP shield |
| **水 Water** | P4,P8,L5,L9 (4) | **+25% ability power**, abilities cost −10 mana | **(4)** +50% AP; first cast each fight is free |
| **火 Fire** | P5,P9,L4,L8 (4) | attacks/abilities apply **Burn** (true DoT) | **(4)** Burn stacks and spreads on death |
| **土 Earth** | P6,L1,L6 (3) | front two rows gain **+20 Armor & 12% max-HP shield** | **(3)** shield refreshes once at 50% HP |

This is what makes the two halves cohere: e.g., **Embershot (Fire panda) + Suanni (Fire loong)** activate 火 together; **Goldchain + Yazi** double-Metal shred; **Bixi + Magma Maul + Bi'an** form an Earth wall that Loong cast safely behind.

### 12C. Signature deep mechanic (ship later): **Wuxing生克 — Generating & Overcoming**

The Five Elements already have a real cosmological relationship. Bolt it on once MVP combat is stable; it needs **zero roster changes**.

- **Generating cycle 相生** (Wood→Fire→Earth→Metal→Water→Wood): if you have an *active* element that **generates** another active element, the generated one gains **+1 effective tier** (a "nourished" glow). Rewards thematic pairs (e.g., Wood feeding Fire).
- **Overcoming cycle 相克** (Wood→Earth→Water→Fire→Metal→Wood): your units deal **+12% damage** to enemies whose element you *overcome*, and take **−12%** from elements that overcome you. Creates real counter-play vs. AI boards and (later) other players.

Present it as the game's identity hook: *"Master the cycle, not just the units."* It's original, authentic, and impossible to confuse with TFT.

---

*(continued in Part 2: economy, shop, leveling, items, augments, PvE, AI, pacing, UI, art, audio, balance, MVP checklist, and the coding-agent handoff.)*

---

## 13. Economy: Gold, Income, Interest, Streaks

| Source | Value |
|---|---|
| Base income / round | 5 |
| Interest | +1 per 10 gold banked, **cap +5** (so banking 50 = +5) |
| Win streak | +1 at 2-streak, +2 at 3, +3 at 4+ |
| Loss streak | same table (comeback gold) |
| Sell refund | cost × 3^(star−1) (full value at 1★; 2★ refunds 3×, etc.) |
| **Sinks** | buy unit (cost), reroll (2), buy XP (4) |

Greed dial: banking to 50 for max interest vs. rolling for a power spike is the central tension. Numbers are deliberately easy to retune.

---

## 14. Shop, Unit Pool, Rerolls & Level Odds

- **5 slots. Reroll = 2 gold. Shop can be frozen (锁定)** to keep slots between rounds.
- **Shared pool** (copies in §5): buying removes copies, so contested units dry up — this is what makes rerolling for 3★ meaningful even in single-player (the AI also draws from it).
- **Level odds (% chance per slot to roll each cost):**

| Lvl | 1★cost | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 2 | 75 | 25 | 0 | 0 | 0 |
| 3 | 60 | 30 | 10 | 0 | 0 |
| 4 | 45 | 33 | 20 | 2 | 0 |
| 5 | 30 | 40 | 25 | 5 | 0 |
| 6 | 22 | 35 | 30 | 10 | 3 |
| 7 | 16 | 30 | 33 | 17 | 4 |
| 8 | 10 | 22 | 32 | 26 | 10 |
| 9 | 5 | 15 | 30 | 30 | 20 |

---

## 15. Experience, Leveling, Tempo & Power Spikes

- **Level cap 9.** Board cap = level (units you may field). Buy XP: **4 gold → 4 XP**; +2 XP free each round.
- **XP to next level:** L2→3:6, 3→4:10, 4→5:20, 5→6:36, 6→7:48, 7→8:66, 8→9:84.
- **Tempo archetypes:** *Roll-down* (push levels slow, reroll low cost for 3★ early); *Fast-9* (bank, level hard, splash 5-costs); *Standard* (level on curve, stabilize at 7–8).
- **Expected level by stage:** ~L4 by round 5, L6 by round 9, L7–8 by round 13.

---

## 16. Items: Components → Completed (start simple)

**MVP: 8 completed items, no recipe grid yet.** Add the 2-component combine system once combat reads cleanly.

| Item (EN / 中文) | Stat / Effect | Wants it |
|---|---|---|
| Tiger Tally 虎符 | +20% AD | Blades, Rangers |
| Jade Talisman 玉符 | +30 ability power | Mystics |
| Iron Robe 铁衣 | +200 HP | Vanguards |
| Wind Bell 风铃 | +15% AS | Rangers, Phantoms |
| Spirit Gourd 灵葫 | start combat with a 200 shield | anyone |
| Cinnabar Brand 朱砂印 | attacks apply Burn (synergizes Fire) | on-hit carries |
| Mirror Pendant 明镜 | reflect 15% magic damage | vs. Loong boards |
| Dragon Pearl 龙珠 | −15 mana cost to first cast | casters |

**Later:** components combine into these; add Artifacts (unique, 1 per board), trait **Emblems** (grant a Bloodline/Element to a non-member — e.g., a *Fire Emblem* makes any unit count as Fire), removers/reforgers, and consumables.

---

## 17. Item Distribution, PvE Drops & Rewards

- **Reward rounds:** 1-1 (a starter item), then every PvE round (§19) drops **1 item or 6 gold (player choice)**.
- **Bad-luck protection:** guarantee at least 1 offensive and 1 defensive item by round 9.
- **Loss comeback:** on a 3+ loss streak, the next reward upgrades to a **choice of 2 items**.
- Keep rewards predictable during prototyping; randomize once balance is known.

---

## 18. Augments / Blessings — **"Celestial Edicts" 天赐**

- **Name in world:** *Celestial Edicts (天赐)*. Offered at **rounds 2, 5, 9** (3 choices each, rerollable once for 1 gold).
- **Tiers:** 玉 Jade (common) / 金 Gold (rare) / 霞 Prism (legendary).
- **First 12 edict ideas:**
  1. *Five-Element Harmony* — each active Element tier also grants +5% to all damage.
  2. *Twin Bloodline* — your lowest-count Bloodline counts +1.
  3. *Dragon's Hoard* — +1 interest cap; start +10 gold.
  4. *Martial Tempo* — Pandas gain +10% AS, lose 5% — wait, keep positive: Pandas +12% AS.
  5. *Arcane Overflow* — Loong overheal becomes a shield.
  6. *Wuxing Adept* — unlock the 相生 Generating bonus early (see §12C).
  7. *Burnbringer* — your Burns tick 50% faster.
  8. *Stoneheart* — Earth shields are +50%.
  9. *Reroll Mastery* — every 3rd reroll is free.
  10. *Assassin's Pact* — Phantoms deal +25% on their jump target.
  11. *Conscription* — gain a random 2-cost each player-combat win.
  12. *Glass Cannon* — +20% team damage, −150 player HP (risk).

---

## 19. PvE Rounds, Bosses & Neutral Encounters

- **Cadence:** rounds 1, 3, 6, 9, 12, 15, and a **final boss** (~round 18–22).
- **Neutral enemies (themed):** 山精 Mountain Sprites (round 1 trainers), 邪蛟 Corrupt Serpents (mid), 罗刹 Rakshasa raiders (late).
- **Bosses:**
  - Mid-boss **石魈将 Stone Warlord** (round 9) — huge Earth tank; teaches "you need shred/true damage."
  - Final **天将·叛龙 Heavenly General, the Fallen Loong** (round ~20) — two phases: weapon phase, then element phase that punishes mono-element boards (telegraphs the overcoming cycle).
- Bosses drop **choice rewards**; PvE telegraphs upcoming threat with a banner ("下一战：石魈将").

---

## 20. Enemy AI, Ghost Boards & Single-Player Opponents

- **Model:** scripted **ghost boards** per round that scale unit count, star level, items, and an element theme — *not* full economy simulation (cheaper, predictable to balance).
- **Named rivals with archetypes** (give them avatars & a line):
  - 烈焰宗 *Pyre Sect* (Fire-Loong burst), 磐石营 *Stoneguard* (Earth wall), 影刃门 *Shadowblade* (Phantom dive), 商旅 *Merchant* (econ/greedy, weak board → tempting win).
- **Scaling table (MVP):** round R → ~`min(8, 1+floor(R×0.9))` units, star = 1 (R<4) / 2 (R<10) / mixed 2–3 (R≥10), with `+6%` stats per round (your prototype already does this).
- **Scouting (later):** preview next opponent's traits during planning.

---

## 21. Health, Damage, Elimination & Comeback

- **Start HP:** player 100, enemy commander 100.
- **On loss:** you take `2 + round + (surviving enemy units × 2)` HP.
- **On win:** enemy commander takes `3 + round×0.8 + surviving allies × 1.5`.
- **Comeback:** loss-streak gold (§13) + better reward choices (§17); a *low-HP "背水" edict* offers risk/reward under 30 HP.
- **Elimination:** HP ≤ 0 → game over screen with run stats.

---

## 22. Round Structure & Pacing

| Stage | Rounds | Player feeling | Pressure | Reward |
|---|---|---|---|---|
| Opening | 1–3 | learn, get starter item & first Edict | PvE + weak ghosts | item, Edict |
| Early | 4–7 | first comp forms, first 3★ | ghost rivals ramp | gold/item |
| Mid | 8–12 | element breakpoints online; mid-boss | Stone Warlord (R9) | choice reward, Edict |
| Late | 13–17 | 5-costs, level 8, spikes | strongest rivals | items |
| Final | 18–22 | all-in; survive the General | 2-phase boss | win/lose |

A new decision or pressure point lands every 2–3 rounds.

---

## 23. User-Facing Content: Tooltips, Names, Icons, Cards

- **Naming:** mythic-martial, bilingual (中文 primary, EN subtitle). Abilities 2–4 syllables.
- **Tooltip template:** `[Name] · [Cost◆] · [Bloodline][Element][Role]` → one-line ability with **exact numbers** for the current star → passive note.
- **Trait panel:** show Bloodline traits (Panda/Loong) at top, then the five Elements with `n/next` and the active tier highlighted (your prototype's left rail already does this — expand to 7 traits).
- **Icons:** Bloodline = panda paw / dragon horn; Elements = 金木水火土 glyphs in their colors (gold/green/blue/red/orange).
- **Shop card:** portrait (your concept art!), name, cost gem, element pip + role pip, "升星/upgrade" hint when 2 copies owned.

---

## 24. Art Direction & Thematic Content

- **Theme:** xianxia "mythic-cute" — chibi sacred beasts, imperial gold + jade + cinnabar, dusk-over-Shanghai skies (your reference video), floating stone arena.
- **Your 9 Panda models = the visual anchor.** They're already on-theme (gold filigree, dragon-head weapons, element-colored sashes). Map each to its element color for instant readability:

| Image | Panda | Element color | Weapon read |
|---|---|---|---|
| 1 | Goldchain | gold (金) | nunchaku + dragon chain |
| 2 | Embershot | red (火) | red/gold bow |
| 3 | Dragoncleaver | gold/black (金) | dragon-head axe |
| 4 | Magma Maul | orange (土) | lion-head war hammer |
| 5 | Twilight Fang | violet (水/abyss) | twin daggers |
| 6 | Crimson Glaive | red (火) | guandao |
| 7 | Bluetide Saber | blue (水) | curved dao |
| 8 | Jade Spear | teal (木) | jade spear |
| 9 | Bamboo Sage | green (木) | bamboo staff |

- **Loong visual language:** sinuous, weaponless, **element-colored energy** (Suanni = fire mane, Chiwen = water coils, Bixi = stone shell, Pulao = bronze bell aura, Yazi = floating spectral blades). Keep them clearly *dragon*, clearly *casting*, never holding a weapon.
- **VFX vocabulary:** magic circles (法阵) under casts, element-tinted particles, sword-arc trails for Pandas, calligraphy strokes for Loong (esp. Fuxi). 3★ adds a halo + extra trail.
- **Board:** one arena now; later swap per realm (bamboo sea, molten forge, jade sea, thunder peak, stone tombs — one per element).

---

## 25. Audio, Feedback & Game Feel

- **Instruments:** guzheng, erhu, dizi flute, taiko/percussion; a low taiko pulse under combat, a guzheng sting on victory.
- **SFX list (MVP):** buy, sell, reroll, level-up, round-start gong, attack hit, crit, spell cast (per element timbre), unit death, trait activate (rising chord), win, loss.
- **Element timbres:** Fire = crackle, Water = wash, Metal = ring, Wood = wood-block, Earth = low thud — so you can *hear* which element just fired.
- **Rare-moment audio:** 3★ upgrade = bell + choir; 9-Bloodline tier = dragon roar / war drums.

---

## 26. Progression Outside the Match

- **MVP: none.** All 18 units available from the start; only a local win/loss screen + run stats.
- **Later:** cosmetic boards & commanders, unit skins, titles, an achievement set ("field all five elements at once"), and an optional roguelite unlock ladder. Cosmetics only — never pay-to-win.

---

## 27. Balance Framework & Playtest Questions

Track each test: winning comp, strongest/weakest unit, average fight length, gold curve, player HP lost, and "what was unclear?"
- Healthy fight length: 12–22 s. If fights end <8 s, lower damage or raise HP globally.
- Target: **≥6 viable comps** (mono-Panda, mono-Loong, and one per element minimum).
- Every role should appear in at least one top comp. Watch for a dominant element (likely Fire or Water) and tune its Tier-2 first.
- Early luck should matter <20% to final placement; comeback systems (§13/§17/§21) must let a 2-loss start recover.

---

## 28. MVP Content Checklist

- [x] Title/codename: **Nine Realms / 九州圣兵**
- [x] Theme & art direction (xianxia mythic-cute)
- [x] Board 7×8, hex, nearest-target
- [x] Planning / Combat / Result phases
- [x] Win & lose rules
- [x] **18 units** (9 Panda + 9 Loong), 5 cost tiers, 6 roles, 1 ability each, star rules
- [x] **7 traits**: 2 Bloodlines + 5 Elements, all with thresholds & clear identity
- [x] Economy: income, interest, streaks, reroll, XP, level odds
- [x] 8 simple items + distribution + PvE reward rounds
- [x] Ghost-board AI schedule + PvE/boss schedule
- [x] Damage-to-player formula + game-over screen
- [x] Card / tooltip / trait-panel templates, SFX list, combat feedback list
- [ ] (Later) Wuxing生克 cycle, component items, emblems, scouting, meta progression

---

## 29. Build Order & Coding-Agent Handoff

Map onto the existing Three.js prototype (it already has hex board, shop, economy, traits panel, combat, damage numbers, Shanghai skyline). Ship in this order:

1. **Roster data** — replace the 5 test pandas with the **18-unit table (§4)**: cost, bloodline, element, role, stats, ability key. *Do not change combat/UI architecture in this ticket.*
2. **Trait engine** — implement the **7 traits (§12A/B)**: count distinct units per Bloodline and per Element; apply tiered buffs at combat start; render all 7 in the left rail (Bloodlines on top, 5 Elements below).
3. **Abilities** — implement the 6 templates (§9) and wire each unit's one ability; add the 5 status effects (Burn/Stun/Root/Armor-break/Shield).
4. **Models** — load your 9 Panda GLBs (one per weapon) instead of one re-tinted panda; Loong can start as tinted dragon stand-ins (sphere+coil) until you have dragon models, then swap.
5. **Economy/shop polish** — add freeze, level-odds table (§14), sell refunds (§13).
6. **PvE & Edicts** — ghost-board schedule (§20), reward rounds (§17), Celestial Edicts at R2/5/9 (§18).
7. **Later** — Wuxing cycle, items/components, emblems, per-realm boards, audio pass.

**Handoff rule (from the bible):** give the agent one filled section at a time, name the goal, point to the source table, and say "don't invent new traits/units in this ticket; list any missing data after."

---

### Appendix A — The Bloodline × Element grid (at a glance)

| | 金 Metal | 木 Wood | 水 Water | 火 Fire | 土 Earth |
|---|---|---|---|---|---|
| **🐼 Panda** | Goldchain(2), Dragoncleaver(4) | Jade Spear(1), Bamboo Sage(1) | Bluetide Saber(2), Twilight Fang(4) | Embershot(3), Crimson Glaive(5) | Magma Maul(3) |
| **🐉 Loong** | Pulao(2), Yazi(4) | Qiuniu(2) | Fuxi(3), Chiwen(5) | Chaofeng(3), Suanni(5) | Bi'an(1), Bixi(4) |

Read a column to build an **element comp** (mixes species); read a row to build a **bloodline comp** (one species, many elements). The best boards do a bit of both — which is exactly the strategic texture you wanted.

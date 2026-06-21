// HUD overlay — top bar, live 7-trait rail, bench, shop, economy & buttons.
// Pure DOM; re-renders from GameState on every change (cheap at this scale).

import { GameState, BENCH_SIZE } from '../game/state';
import { ALL_TRAITS, computeTraits } from '../data/traits';
import { ELEMENT_COLOR } from '../data/constants';
import { ECONOMY, LEVEL_CAP } from '../data/constants';
import { sellValue } from '../game/units';
import type { Element } from '../data/types';

export interface HudActions {
  onBenchClick(index: number): void;
  onBegin(): void;
}

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

export class HUD {
  private root: HTMLElement;
  private traitsEl!: HTMLElement;
  private benchEl!: HTMLElement;
  private shopEl!: HTMLElement;
  private goldEl!: HTMLElement;
  private unitCountEl!: HTMLElement;
  private xpEl!: HTMLElement;
  private xpFillEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private roundEl!: HTMLElement;
  private hpEl!: HTMLElement;
  private freezeBtn!: HTMLButtonElement;

  constructor(private state: GameState, private actions: HudActions) {
    this.root = document.createElement('div');
    this.root.id = 'hud';
    document.body.appendChild(this.root);
    this.build();
    this.state.onChange(() => this.update());
    this.update();
  }

  private build(): void {
    // top bar
    const top = el('div', 'top');
    const pcard = el('div', 'pcard');
    pcard.innerHTML = `
      <div class="por">仙</div>
      <div class="pmeta">
        <div class="pname">仙策 · Strategist</div>
        <div class="hpbar"><i id="hp-i"></i><span id="hp-t"></span></div>
      </div>
      <div class="lvlpill" id="lvl"></div>`;
    const stage = el('div', 'stagebox');
    stage.innerHTML = `<div class="st" id="round"></div><div class="pl">PLAN</div>`;
    top.append(pcard, stage);
    this.root.appendChild(top);
    this.hpEl = pcard.querySelector('#hp-i') as HTMLElement;
    this.levelEl = pcard.querySelector('#lvl') as HTMLElement;
    this.roundEl = stage.querySelector('#round') as HTMLElement;

    // trait rail
    const rail = el('div', 'rail');
    rail.innerHTML = `<div class="railhd">羁绊 · SYNERGY</div>`;
    this.traitsEl = el('div');
    rail.appendChild(this.traitsEl);
    this.root.appendChild(rail);

    // bottom dock
    const dock = el('div', 'dock');
    this.benchEl = el('div', 'bench');
    const econ = el('div', 'econ');
    econ.innerHTML = `
      <span class="g" id="gold"></span>
      <span class="uc">棋子 <b id="uc"></b></span>
      <div class="xpwrap"><div class="xptxt"><span>经验 Lv<b id="xpl"></b></span><span id="xp"></span></div><div class="xpbar"><i id="xpf"></i></div></div>`;
    this.goldEl = econ.querySelector('#gold') as HTMLElement;
    this.unitCountEl = econ.querySelector('#uc') as HTMLElement;
    this.xpEl = econ.querySelector('#xp') as HTMLElement;
    this.xpFillEl = econ.querySelector('#xpf') as HTMLElement;

    const shoprow = el('div', 'shoprow');
    const leftBtns = el('div', 'sidebtns');
    const xpBtn = button('购买经验', `${ECONOMY.xpBuyCost}金 / +${ECONOMY.xpBuyAmount}XP`, 'gold');
    xpBtn.onclick = () => this.state.buyXP();
    const rerollBtn = button('刷新', `${ECONOMY.rerollCost}金 · D`);
    rerollBtn.onclick = () => this.state.reroll();
    leftBtns.append(xpBtn, rerollBtn);

    this.shopEl = el('div', 'shop');

    const rightBtns = el('div', 'sidebtns');
    this.freezeBtn = button('锁定', 'Freeze');
    this.freezeBtn.onclick = () => this.state.toggleFreeze();
    const beginBtn = button('开战', 'Space', 'start');
    beginBtn.onclick = () => this.actions.onBegin();
    rightBtns.append(this.freezeBtn, beginBtn);

    shoprow.append(leftBtns, this.shopEl, rightBtns);
    dock.append(this.benchEl, econ, shoprow);
    this.root.appendChild(dock);
  }

  update(): void {
    const s = this.state;
    this.goldEl.textContent = String(s.gold);
    this.unitCountEl.textContent = `${s.boardCount()}/${s.level}`;
    this.levelEl.textContent = `Lv ${s.level}`;
    this.roundEl.textContent = `第 ${s.round} 回合`;
    this.hpEl.style.width = `${s.hp}%`;
    (this.root.querySelector('#hp-t') as HTMLElement).textContent = `${s.hp}`;
    (this.root.querySelector('#xpl') as HTMLElement).textContent = String(s.level);
    const toNext = s.xpToNext();
    this.xpEl.textContent = s.level >= LEVEL_CAP ? 'MAX' : `${s.xp}/${toNext}`;
    this.xpFillEl.style.width = s.level >= LEVEL_CAP ? '100%' : `${(s.xp / toNext) * 100}%`;
    this.freezeBtn.classList.toggle('gold', s.shopFrozen);

    this.renderTraits();
    this.renderBench();
    this.renderShop();
  }

  private renderTraits(): void {
    const active = computeTraits(this.state.boardUnits().map((u) => u.def));
    const byId = new Map(active.map((a) => [a.def.id, a]));
    this.traitsEl.innerHTML = '';
    for (const def of ALL_TRAITS) {
      const a = byId.get(def.id);
      const count = a?.count ?? 0;
      const on = (a?.activeTierIndex ?? -1) >= 0;
      const next = def.tiers.find((t) => t.count > count)?.count ?? def.tiers[def.tiers.length - 1].count;
      const row = el('div', `trait${on ? ' on' : ''}`);
      row.style.setProperty('--tc', hex(def.color));
      row.innerHTML = `
        <span class="tIcon">${def.nameZh}</span>
        <span class="tName">${def.name.split(' ')[0]}<small>${def.kind}</small></span>
        <span class="tNum">${count}/${next}</span>`;
      this.traitsEl.appendChild(row);
    }
  }

  private renderBench(): void {
    this.benchEl.innerHTML = '';
    for (let i = 0; i < BENCH_SIZE; i++) {
      const unit = this.state.bench[i];
      const slot = el('div', 'bslot');
      if (unit) {
        slot.classList.add('filled');
        if (this.state.selectedUid === unit.uid) slot.classList.add('sel');
        slot.style.setProperty('--rc', hex(ELEMENT_COLOR[unit.def.element as Element]));
        slot.innerHTML = `<span class="bStar">${'★'.repeat(unit.star)}</span><span class="bName">${unit.def.nameZh}</span>`;
      }
      slot.onclick = () => this.actions.onBenchClick(i);
      this.benchEl.appendChild(slot);
    }
  }

  private renderShop(): void {
    this.shopEl.innerHTML = '';
    this.state.shop.forEach((def, i) => {
      if (!def) {
        const empty = el('div', 'card empty');
        this.shopEl.appendChild(empty);
        return;
      }
      const color = hex(ELEMENT_COLOR[def.element as Element]);
      const card = el('div', 'card');
      card.style.setProperty('--cc', color);
      const affordable = this.state.gold >= def.cost;
      card.style.opacity = affordable ? '1' : '0.55';
      card.innerHTML = `
        <div class="cTop" style="border-color:${color}"><span class="cName">${def.nameZh}</span></div>
        <div class="cBody">
          <div class="cTr"><i style="background:${color}"></i>${def.element} · ${def.bloodline}</div>
          <div class="cTr" style="color:#b7a9cf">${def.role}</div>
        </div>
        <div class="cCost" style="color:${color}">◆ ${def.cost}</div>`;
      card.onclick = () => this.state.buyFromShop(i);
      this.shopEl.appendChild(card);
    });
  }
}

function el(tag: string, cls = ''): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function button(label: string, sub = '', extra = ''): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = `btn${extra ? ' ' + extra : ''}`;
  b.innerHTML = `${label}${sub ? `<small>${sub}</small>` : ''}`;
  return b;
}

// re-export so the input layer can show sell value in tooltips later
export { sellValue };

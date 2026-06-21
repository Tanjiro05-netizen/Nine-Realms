// Combat-time rendering: a mesh per combatant (both teams), DOM HP/mana bars
// and floating damage numbers projected world->screen each frame, plus a quick
// cast ring VFX. Lives only for the duration of a fight.

import * as THREE from 'three';
import { loadUnitModel } from './models';
import type { Combatant } from '../combat/combatant';
import type { CombatEvent } from '../combat/sim';

interface CView {
  container: THREE.Group;
  bar: HTMLDivElement;
  hpI: HTMLElement;
  mpI: HTMLElement;
  shI: HTMLElement;
}

const ALLY = 0x46e6cf;
const ENEMY = 0xff5a4d;

export class CombatView {
  private group = new THREE.Group();
  private bars: HTMLDivElement;
  private fx: HTMLDivElement;
  private views = new Map<string, CView>();
  private rings: Array<{ mesh: THREE.Mesh; born: number }> = [];
  private tmp = new THREE.Vector3();

  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {
    this.scene.add(this.group);
    this.bars = document.createElement('div');
    this.bars.id = 'bars';
    this.fx = document.createElement('div');
    this.fx.id = 'fx';
    document.body.append(this.bars, this.fx);
  }

  build(units: Combatant[]): void {
    for (const c of units) {
      const container = new THREE.Group();
      container.position.set(c.x, 0.25, c.z);
      this.group.add(container);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.6, 28),
        new THREE.MeshBasicMaterial({ color: c.team === 'player' ? ALLY : ENEMY, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      container.add(ring);

      void loadUnitModel(c.def).then((model) => {
        const facing = c.team === 'player' ? -1 : 1;
        model.rotation.y = facing < 0 ? 0 : Math.PI;
        container.add(model);
      });

      const bar = document.createElement('div');
      bar.className = `ubar ${c.team}`;
      bar.innerHTML = `<div class="hp"><i></i></div><div class="sh"><i></i></div><div class="mp"><i></i></div>`;
      this.bars.appendChild(bar);
      const [hpWrap, shWrap, mpWrap] = bar.children;
      this.views.set(c.uid, {
        container,
        bar,
        hpI: hpWrap.firstElementChild as HTMLElement,
        shI: shWrap.firstElementChild as HTMLElement,
        mpI: mpWrap.firstElementChild as HTMLElement,
      });
    }
  }

  update(units: Combatant[], events: CombatEvent[], now: number): void {
    const W = window.innerWidth;
    const H = window.innerHeight;

    for (const c of units) {
      const v = this.views.get(c.uid);
      if (!v) continue;
      v.container.position.set(c.x, 0.25, c.z);
      v.container.visible = c.alive;

      if (!c.alive) {
        v.bar.style.display = 'none';
        continue;
      }
      this.tmp.set(c.x, 2.1, c.z).project(this.camera);
      if (this.tmp.z > 1) {
        v.bar.style.display = 'none';
        continue;
      }
      const sx = (this.tmp.x * 0.5 + 0.5) * W;
      const sy = (-this.tmp.y * 0.5 + 0.5) * H;
      v.bar.style.display = 'block';
      v.bar.style.left = `${sx - 26}px`;
      v.bar.style.top = `${sy}px`;
      v.hpI.style.width = `${(c.hp / c.maxHp) * 100}%`;
      v.shI.style.width = `${Math.min(100, (c.shield / c.maxHp) * 100)}%`;
      v.mpI.style.width = c.manaMax > 0 ? `${(c.mana / c.manaMax) * 100}%` : '0%';
    }

    for (const e of events) {
      this.tmp.set(e.x, 1.7, e.z).project(this.camera);
      if (this.tmp.z > 1) continue;
      const sx = (this.tmp.x * 0.5 + 0.5) * W;
      const sy = (-this.tmp.y * 0.5 + 0.5) * H;
      if (e.kind === 'dmg') this.spawnDamage(sx, sy, e.amount, e.crit, e.dtype);
      else this.castRing(e.x, e.z, e.color);
    }
    events.length = 0;

    // fade cast rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      const age = (now - r.born) / 600;
      if (age >= 1) {
        this.group.remove(r.mesh);
        r.mesh.geometry.dispose();
        (r.mesh.material as THREE.Material).dispose();
        this.rings.splice(i, 1);
      } else {
        r.mesh.scale.setScalar(0.4 + age * 2.4);
        (r.mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - age);
      }
    }
  }

  private spawnDamage(sx: number, sy: number, amount: number, crit: boolean, dtype: string): void {
    const el = document.createElement('div');
    el.className = `dmg${crit ? ' crit' : ''}`;
    el.textContent = String(amount);
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    el.style.color = dtype === 'magic' ? '#9ad0ff' : dtype === 'true' ? '#ff9a3a' : '#fff';
    this.fx.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translate(-50%,-160%)';
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 700);
  }

  private castRing(x: number, z: number, color: number): void {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.7, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.05, z);
    this.group.add(mesh);
    this.rings.push({ mesh, born: performance.now() });
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mt of mats) mt?.dispose();
      }
    });
    this.group.clear();
    this.bars.remove();
    this.fx.remove();
    this.views.clear();
    this.rings = [];
  }
}

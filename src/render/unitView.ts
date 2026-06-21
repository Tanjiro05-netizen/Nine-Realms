// Syncs Three.js unit meshes with the board state. Adds/removes/moves models,
// shows a star ring + element-tinted selection halo.

import * as THREE from 'three';
import type { GameState } from '../game/state';
import type { Board } from './board';
import { loadUnitModel } from './models';

interface View {
  container: THREE.Group;
  defId: string;
  star: number;
  selectRing: THREE.Mesh;
}

export class UnitView {
  private views = new Map<string, View>();

  constructor(
    private scene: THREE.Scene,
    private board: Board,
    private state: GameState,
  ) {}

  sync(): void {
    const board = this.state.board;
    const liveUids = new Set<string>();

    for (const [key, unit] of board) {
      liveUids.add(unit.uid);
      const [col, row] = key.split(',').map(Number);
      const pos = this.board.cellToWorld(col, row);

      let view = this.views.get(unit.uid);
      if (!view) {
        view = this.createView(unit.uid, unit.def.model.tint ?? 0xffffff);
        this.views.set(unit.uid, view);
        void this.attachModel(view, unit.uid);
      }
      view.container.position.set(pos.x, pos.y, pos.z);
      view.container.lookAt(pos.x, pos.y, pos.z - 1);

      if (view.defId !== unit.def.id || view.star !== unit.star) {
        view.defId = unit.def.id;
        view.star = unit.star;
        void this.attachModel(view, unit.uid);
      }

      const selected = this.state.selectedUid === unit.uid;
      (view.selectRing.material as THREE.MeshBasicMaterial).opacity = selected ? 0.9 : 0.0;
    }

    // remove views no longer on the board
    for (const [uid, view] of this.views) {
      if (!liveUids.has(uid)) {
        this.scene.remove(view.container);
        disposeGroup(view.container);
        this.views.delete(uid);
      }
    }
  }

  private createView(uid: string, tint: number): View {
    const container = new THREE.Group();
    container.userData.uid = uid;

    const ringGeo = new THREE.RingGeometry(0.5, 0.62, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: tint,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const selectRing = new THREE.Mesh(ringGeo, ringMat);
    selectRing.rotation.x = -Math.PI / 2;
    selectRing.position.y = 0.02;
    container.add(selectRing);

    this.scene.add(container);
    return { container, defId: '', star: 0, selectRing };
  }

  private async attachModel(view: View, uid: string): Promise<void> {
    const unit = this.state.unitById(uid);
    if (!unit) return;
    // remove old model meshes (keep the select ring)
    for (const child of [...view.container.children]) {
      if (child !== view.selectRing) {
        view.container.remove(child);
        if (child instanceof THREE.Group) disposeGroup(child);
      }
    }
    const model = await loadUnitModel(unit.def);
    // still the same instance on the board?
    if (this.state.unitById(uid) !== unit || unit.loc.kind !== 'board') {
      disposeGroup(model);
      return;
    }
    model.add(makeStarBadge(unit.star));
    view.container.add(model);
  }
}

function makeStarBadge(star: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: star >= 3 ? 0xffdf94 : star === 2 ? 0xd8d8e8 : 0xc78b3a });
  for (let i = 0; i < star; i++) {
    const star3d = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), mat);
    star3d.position.set((i - (star - 1) / 2) * 0.18, 1.95, 0);
    g.add(star3d);
  }
  return g;
}

function disposeGroup(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) m?.dispose();
    }
  });
}

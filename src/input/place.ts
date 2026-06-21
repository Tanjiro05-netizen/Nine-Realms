// Click-to-select/place/swap on the hex board + keyboard shortcuts.
// Raycasts the tile meshes (units sit above their tile, so we always resolve
// the cell beneath the cursor).

import * as THREE from 'three';
import type { GameState } from '../game/state';
import type { Board } from '../render/board';

export interface InputHooks {
  onBegin(): void;
}

export class Input {
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private downPos = new THREE.Vector2();

  constructor(
    private dom: HTMLElement,
    private camera: THREE.Camera,
    private board: Board,
    private state: GameState,
    private hooks: InputHooks,
  ) {
    this.dom.addEventListener('pointerdown', this.onPointerDown);
    this.dom.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKey);
  }

  /** Public so the HUD bench can route clicks through the same selection logic. */
  benchClick(index: number): void {
    const occupant = this.state.bench[index];
    const selUid = this.state.selectedUid;
    if (selUid) {
      const sel = this.state.unitById(selUid);
      if (!sel) return;
      if (occupant) {
        this.state.select(occupant.uid === selUid ? null : occupant.uid);
      } else {
        this.state.moveUnit(selUid, { kind: 'bench', index });
      }
    } else if (occupant) {
      this.state.select(occupant.uid);
    }
  }

  private tileClick(col: number, row: number): void {
    const occupant = this.state.unitAt({ kind: 'board', col, row });
    const selUid = this.state.selectedUid;
    if (selUid) {
      const moved = this.state.moveUnit(selUid, { kind: 'board', col, row });
      if (!moved && occupant) this.state.select(occupant.uid);
    } else if (occupant) {
      this.state.select(occupant.uid);
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.downPos.set(e.clientX, e.clientY);
  };

  private onPointerUp = (e: PointerEvent): void => {
    // ignore drags (orbit camera)
    if (this.downPos.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 6) return;
    const rect = this.dom.getBoundingClientRect();
    this.ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    const hits = this.ray.intersectObjects(this.board.tiles, false);
    if (hits.length > 0) {
      const { col, row } = hits[0].object.userData as { col: number; row: number };
      this.tileClick(col, row);
    } else {
      this.state.select(null);
    }
  };

  private onKey = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'KeyD':
        this.state.reroll();
        break;
      case 'KeyF':
        this.state.buyXP();
        break;
      case 'KeyE':
        this.state.sellSelected();
        break;
      case 'KeyL':
        this.state.toggleFreeze();
        break;
      case 'Space':
        e.preventDefault();
        this.hooks.onBegin();
        break;
      case 'Escape':
        this.state.select(null);
        break;
    }
  };
}

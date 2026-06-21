// Nine Realms — entry point. Plan-phase game loop (M2/M3):
// stage + board + state + shop/bench HUD + click-to-place + live trait rail.

import * as THREE from 'three';
import { createStage } from './render/scene';
import { createSky } from './render/sky';
import { createBoard } from './render/board';
import { UnitView } from './render/unitView';
import { GameState } from './game/state';
import { HUD } from './ui/hud';
import { Input } from './input/place';
import { ROSTER } from './data/roster';
import { computeTraits } from './data/traits';
import type { UnitDef } from './data/types';

declare global {
  interface Window {
    __NINE_REALMS__: { ready: boolean; rosterSize: number };
    NineRealms: { state: GameState; roster: UnitDef[]; computeTraits: typeof computeTraits };
  }
}

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const stage = createStage(canvas);
stage.scene.add(createSky());

const board = createBoard();
stage.scene.add(board.group);

const state = new GameState();
const unitView = new UnitView(stage.scene, board, state);
state.onChange(() => unitView.sync());

const input = new Input(canvas, stage.camera, board, state, { onBegin });
new HUD(state, {
  onBenchClick: (i) => input.benchClick(i),
  onBegin,
});

unitView.sync();
hideLoader();

window.__NINE_REALMS__ = { ready: true, rosterSize: ROSTER.length };
window.NineRealms = { state, roster: ROSTER, computeTraits };

function onBegin(): void {
  // Combat is implemented in M4; for now acknowledge the action.
  toast('开战 — combat lands in M4');
}

function hideLoader(): void {
  document.getElementById('loader')?.classList.add('hidden');
}

let toastTimer = 0;
function toast(msg: string): void {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t!.classList.remove('show'), 1800);
}

const clock = new THREE.Clock();
function animate(): void {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  stage.controls.update();
  // gentle idle bob for placed units
  for (const child of stage.scene.children) {
    if (child.userData?.uid) child.position.y = 0.25 + Math.sin(t * 1.6 + child.position.x) * 0.04;
  }
  stage.renderer.render(stage.scene, stage.camera);
}
animate();

// Nine Realms — entry point. Plan-phase game loop (M2/M3):
// stage + board + state + shop/bench HUD + click-to-place + live trait rail.

import * as THREE from 'three';
import { createStage } from './render/scene';
import { createSky } from './render/sky';
import { createBoard } from './render/board';
import { UnitView } from './render/unitView';
import { GameState } from './game/state';
import { CombatController } from './combat/controller';
import { HUD } from './ui/hud';
import { Input } from './input/place';
import { ROSTER } from './data/roster';
import { computeTraits } from './data/traits';
import type { UnitDef } from './data/types';

declare global {
  interface Window {
    __NINE_REALMS__: { ready: boolean; rosterSize: number };
    NineRealms: {
      state: GameState;
      controller: CombatController;
      roster: UnitDef[];
      computeTraits: typeof computeTraits;
    };
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

const controller = new CombatController(stage.scene, stage.camera, board, state, unitView, (result) => {
  const msg = result === 'player' ? '胜 · VICTORY' : result === 'enemy' ? '败 · DEFEAT' : '平 · DRAW';
  toast(msg);
  if (state.isGameOver()) {
    toast(state.hp <= 0 ? '游戏结束 · GAME OVER' : '天将伏诛 · YOU WIN');
  }
});

const input = new Input(canvas, stage.camera, board, state, { onBegin });
new HUD(state, {
  onBenchClick: (i) => input.benchClick(i),
  onBegin,
});

unitView.sync();
hideLoader();

window.__NINE_REALMS__ = { ready: true, rosterSize: ROSTER.length };
window.NineRealms = { state, controller, roster: ROSTER, computeTraits };

function onBegin(): void {
  if (state.isGameOver()) return;
  if (!controller.begin()) toast('先布阵 — place a unit first');
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
let elapsed = 0;
function animate(): void {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  elapsed += dt;
  stage.controls.update();

  if (state.phase === 'combat') {
    controller.update(dt, performance.now());
  } else {
    // gentle idle bob for placed units while planning
    for (const child of stage.scene.children) {
      if (child.userData?.uid) child.position.y = 0.25 + Math.sin(elapsed * 1.6 + child.position.x) * 0.04;
    }
  }
  stage.renderer.render(stage.scene, stage.camera);
}
animate();

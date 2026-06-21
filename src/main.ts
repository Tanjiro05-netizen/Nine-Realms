// Nine Realms — entry point (M0/M1 foundation).
// Boots the stage, sky, hex board, and places the available units to verify
// the render pipeline + optimized model loading end to end.

import * as THREE from 'three';
import { createStage } from './render/scene';
import { createSky } from './render/sky';
import { createBoard } from './render/board';
import { loadUnitModel } from './render/models';
import { ROSTER, PANDAS, LOONG } from './data/roster';
import { computeTraits } from './data/traits';
import type { UnitDef } from './data/types';

interface ReadyFlag {
  ready: boolean;
  unitsPlaced: number;
  rosterSize: number;
}
declare global {
  interface Window {
    __NINE_REALMS__: ReadyFlag;
    NineRealms: { roster: UnitDef[]; computeTraits: typeof computeTraits };
  }
}

const flag: ReadyFlag = { ready: false, unitsPlaced: 0, rosterSize: ROSTER.length };
window.__NINE_REALMS__ = flag;
window.NineRealms = { roster: ROSTER, computeTraits };

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const stage = createStage(canvas);
stage.scene.add(createSky());

const board = createBoard();
stage.scene.add(board.group);

// Demo placement: show the three real panda models + a few Loong placeholders
// on the player half so the model pipeline is visibly verified.
const demoPandas = [
  PANDAS.find((u) => u.id === 'p_goldchain')!, // nunchaku model
  PANDAS.find((u) => u.id === 'p_bamboosage')!, // staff model
  PANDAS.find((u) => u.id === 'p_magmamaul')!, // hammer model
];
const demoLoong = [
  LOONG.find((u) => u.id === 'l_suanni')!,
  LOONG.find((u) => u.id === 'l_chiwen')!,
  LOONG.find((u) => u.id === 'l_bixi')!,
];

const placements: Array<{ unit: UnitDef; col: number; row: number }> = [
  { unit: demoPandas[0], col: 1, row: 7 },
  { unit: demoPandas[1], col: 3, row: 7 },
  { unit: demoPandas[2], col: 5, row: 7 },
  { unit: demoLoong[0], col: 2, row: 6 },
  { unit: demoLoong[1], col: 4, row: 6 },
  { unit: demoLoong[2], col: 3, row: 5 },
];

async function placeAll(): Promise<void> {
  setLoader('召唤圣兽…');
  for (const { unit, col, row } of placements) {
    try {
      const model = await loadUnitModel(unit);
      const p = board.cellToWorld(col, row);
      model.position.copy(p);
      model.lookAt(p.x, p.y, p.z - 1); // face the enemy half
      stage.scene.add(model);
      flag.unitsPlaced++;
    } catch (err) {
      console.error(`[main] failed to place ${unit.id}`, err);
    }
  }
  hideLoader();
  flag.ready = true;
}

function setLoader(text: string): void {
  const el = document.getElementById('loadtxt');
  if (el) el.textContent = text;
}
function hideLoader(): void {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}

const clock = new THREE.Clock();
function animate(): void {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  // gentle idle bob handled later per-unit; for now just spin controls damping
  stage.controls.update();
  stage.scene.traverse((o) => {
    if (o.userData?.loongBob) o.position.y = o.userData.baseY + Math.sin(t * 2) * 0.05;
  });
  stage.renderer.render(stage.scene, stage.camera);
}

placeAll();
animate();

// eslint-disable-next-line no-console
console.log(
  `[Nine Realms] roster=${ROSTER.length} units; traits=${computeTraits(placements.map((p) => p.unit)).filter((t) => t.activeTierIndex >= 0).length} active in demo board`,
);

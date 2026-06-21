// Orchestrates a fight: snapshots the player board, generates a ghost board,
// derives each team's trait bonuses, runs the sim and drives the combat view,
// then resolves the result back into the game state.

import * as THREE from 'three';
import type { Board } from '../render/board';
import { ROWS } from '../render/board';
import type { GameState } from '../game/state';
import type { UnitView } from '../render/unitView';
import { CombatView } from '../render/combatView';
import { Combat, type CombatResult } from './sim';
import { makeCombatant, type Combatant } from './combatant';
import { deriveBonuses } from './bonuses';
import { makeGhostBoard, ghostStatMult } from './ghost';

const MID = ROWS / 2;

export class CombatController {
  private combat: Combat | null = null;
  private view: CombatView | null = null;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private board: Board,
    private state: GameState,
    private unitView: UnitView,
    private onResult?: (result: CombatResult) => void,
  ) {}

  get active(): boolean {
    return this.combat !== null;
  }

  begin(): boolean {
    if (!this.state.beginCombat()) return false;

    const playerDefs = this.state.boardUnits().map((u) => u.def);
    const enemySpawns = makeGhostBoard(this.state.round);
    const playerBonus = deriveBonuses(playerDefs);
    const enemyBonus = deriveBonuses(enemySpawns.map((s) => s.def));
    const eMult = ghostStatMult(this.state.round);

    const combatants: Combatant[] = [];

    for (const u of this.state.boardUnits()) {
      if (u.loc.kind !== 'board') continue;
      const p = this.board.cellToWorld(u.loc.col, u.loc.row);
      const isFront = u.loc.row <= MID + 1; // player front two rows (4,5)
      combatants.push(
        makeCombatant(u.uid, 'player', u.def, u.star, p.x, p.z, playerBonus, isFront),
      );
    }

    enemySpawns.forEach((s, i) => {
      const p = this.board.cellToWorld(s.col, s.row);
      const isFront = s.row >= MID - 2; // enemy front two rows (2,3)
      const c = makeCombatant(`e${i}`, 'enemy', s.def, s.star, p.x, p.z, enemyBonus, isFront);
      c.maxHp = Math.round(c.maxHp * eMult);
      c.hp = c.maxHp;
      c.ad = Math.round(c.ad * eMult);
      combatants.push(c);
    });

    this.unitView.setVisible(false);
    this.combat = new Combat(combatants);
    this.view = new CombatView(this.scene, this.camera);
    this.view.build(combatants);
    return true;
  }

  update(dt: number, now: number): void {
    if (!this.combat || !this.view) return;
    this.combat.advance(dt);
    this.view.update(this.combat.units, this.combat.events, now);
    if (this.combat.finished) this.end();
  }

  private end(): void {
    if (!this.combat || !this.view) return;
    const result = this.combat.result ?? 'draw';
    const allySurvivors = this.combat.survivors('player');
    const enemySurvivors = this.combat.survivors('enemy');

    this.view.dispose();
    this.view = null;
    this.combat = null;

    const mapped = result === 'player' ? 'win' : result === 'enemy' ? 'loss' : 'draw';
    this.state.resolveCombat(mapped, allySurvivors, enemySurvivors);

    this.unitView.setVisible(true);
    this.unitView.sync();
    this.onResult?.(result);
  }
}

// Hex board 7 columns x 8 rows, split 4 player / 4 enemy (Bible §3, PDF §15-M1).
// Pointy-top hexes laid out in offset coordinates on a floating stone arena.

import * as THREE from 'three';

export const COLS = 7;
export const ROWS = 8;
export const HEX_RADIUS = 1.0;

export const HEX_W = Math.sqrt(3) * HEX_RADIUS; // pointy-top width (center-to-center horizontally)
const HEX_VSTEP = 1.5 * HEX_RADIUS;

export interface Board {
  group: THREE.Group;
  /** raycast targets; each tile mesh has userData {col,row}. */
  tiles: THREE.Mesh[];
  /** world position (x,y,z) of a cell center; y is the tile top. */
  cellToWorld(col: number, row: number): THREE.Vector3;
  isPlayerRow(row: number): boolean;
}

export function createBoard(): Board {
  const group = new THREE.Group();
  const tiles: THREE.Mesh[] = [];

  const offsetX = -((COLS - 1) * HEX_W + HEX_W / 2) / 2;
  const offsetZ = -((ROWS - 1) * HEX_VSTEP) / 2;
  const tileTop = 0.25;

  const cellToWorld = (col: number, row: number): THREE.Vector3 => {
    const x = offsetX + col * HEX_W + (row % 2 ? HEX_W / 2 : 0);
    const z = offsetZ + row * HEX_VSTEP;
    return new THREE.Vector3(x, tileTop, z);
  };

  const isPlayerRow = (row: number) => row >= ROWS / 2;

  // Floating stone platform beneath the tiles.
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(COLS * 1.7, COLS * 1.55, 1.4, 48),
    new THREE.MeshStandardMaterial({ color: 0x2a2233, roughness: 0.95, metalness: 0.05 }),
  );
  platform.position.y = -0.55;
  platform.receiveShadow = true;
  group.add(platform);

  const tileGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.93, HEX_RADIUS * 0.93, 0.5, 6);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0x29405a, roughness: 0.8, metalness: 0.15, emissive: 0x0a1a2a, emissiveIntensity: 0.4 });
  const enemyMat = new THREE.MeshStandardMaterial({ color: 0x4a2230, roughness: 0.8, metalness: 0.15, emissive: 0x2a0a12, emissiveIntensity: 0.4 });

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = new THREE.Mesh(tileGeo, isPlayerRow(row) ? playerMat : enemyMat);
      const p = cellToWorld(col, row);
      tile.position.set(p.x, 0, p.z);
      tile.rotation.y = Math.PI / 6; // orient pointy-top
      tile.receiveShadow = true;
      tile.userData = { col, row };
      group.add(tile);
      tiles.push(tile);
    }
  }

  return { group, tiles, cellToWorld, isPlayerRow };
}

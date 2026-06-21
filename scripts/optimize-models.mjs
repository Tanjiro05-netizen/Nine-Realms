// Asset optimization pipeline (PDF §5/§6).
// Shrinks the raw character GLBs (45–67 MB each) into web-ready models using
// gltf-transform: dedup/prune/weld/quantize geometry, resize+compress textures
// to WebP, and apply Meshopt compression (decoder embeds its own WASM in three).
//
// Usage:  node scripts/optimize-models.mjs
// Source models live OUTSIDE the repo (they exceed GitHub limits); output goes
// to public/models/ which Vite serves at /models/*.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repo = resolve(__dirname, '..');
const SRC_DIR = '/Users/andreaskurz/Downloads/Character models';
const OUT_DIR = resolve(repo, 'public/models');

const JOBS = [
  { in: 'Nunchakus.glb', out: 'nunchakus.glb' },
  { in: 'staff.glb', out: 'staff.glb' },
  { in: 'Hammer.glb', out: 'hammer.glb' },
];

const TEXTURE_SIZE = 1024;

mkdirSync(OUT_DIR, { recursive: true });

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);

for (const job of JOBS) {
  const inPath = resolve(SRC_DIR, job.in);
  const outPath = resolve(OUT_DIR, job.out);
  if (!existsSync(inPath)) {
    console.warn(`[skip] source not found: ${inPath}`);
    continue;
  }
  console.log(`\n[optimize] ${job.in} (${mb(inPath)} MB) -> public/models/${job.out}`);
  execFileSync(
    'npx',
    [
      'gltf-transform',
      'optimize',
      inPath,
      outPath,
      '--compress',
      'meshopt',
      '--texture-compress',
      'webp',
      '--texture-size',
      String(TEXTURE_SIZE),
    ],
    { stdio: 'inherit', cwd: repo },
  );
  console.log(`[done] ${job.out} -> ${mb(outPath)} MB`);
}

console.log('\nAll models optimized into public/models/.');

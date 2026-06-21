// Procedural dusk-over-Shanghai sky dome + a simple skyline silhouette.
// Gradient shader sky (no asset download) — matches prototype intent. PDF §3, Bible §24.

import * as THREE from 'three';

export function createSky(): THREE.Group {
  const group = new THREE.Group();

  const skyGeo = new THREE.SphereGeometry(200, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x1a1430) },
      mid: { value: new THREE.Color(0x6b3a6e) },
      hor: { value: new THREE.Color(0xe8915a) },
      bot: { value: new THREE.Color(0x140d14) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vp;
      void main() {
        vp = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 top, mid, hor, bot;
      varying vec3 vp;
      void main() {
        float h = normalize(vp).y;
        vec3 c = h > 0.0
          ? mix(mix(hor, mid, smoothstep(0.0, 0.35, h)), top, smoothstep(0.3, 0.9, h))
          : mix(hor, bot, smoothstep(0.0, -0.4, h));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  group.add(new THREE.Mesh(skyGeo, skyMat));

  // Skyline silhouette: a ring of dark towers on the horizon.
  const skyline = new THREE.Group();
  const towerMat = new THREE.MeshBasicMaterial({ color: 0x0b0813 });
  const rng = mulberry32(20240601);
  const count = 90;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const dist = 120 + rng() * 20;
    const w = 2 + rng() * 4;
    const h = 8 + rng() * 38;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), towerMat);
    tower.position.set(Math.cos(a) * dist, h / 2 - 2, Math.sin(a) * dist);
    skyline.add(tower);
  }
  group.add(skyline);

  return group;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

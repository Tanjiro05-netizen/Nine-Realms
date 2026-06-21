// Asset loading — real http loading via GLTFLoader + Meshopt decoder (no blob hack). PDF §13.
// Panda units load their optimized GLB; Loong use a stylized placeholder until modeled.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { ModelRef, UnitDef } from '../data/types';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const cache = new Map<string, Promise<THREE.Group>>();

function loadGLB(src: string): Promise<THREE.Group> {
  const cached = cache.get(src);
  const base =
    cached ??
    loader.loadAsync(src).then((gltf) => {
      const root = gltf.scene;
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      normalizeToHeight(root, 1.7);
      return root;
    });
  if (!cached) cache.set(src, base);
  return base.then((g) => g.clone(true));
}

/** Scale & recenter a model so it stands `targetHeight` tall, feet at y=0. */
function normalizeToHeight(obj: THREE.Object3D, targetHeight: number): void {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const h = size.y || 1;
  const s = targetHeight / h;
  obj.scale.setScalar(s);
  const box2 = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  box2.getCenter(center);
  obj.position.x -= center.x;
  obj.position.z -= center.z;
  obj.position.y -= box2.min.y;
}

/** Stylized weaponless Loong placeholder: a coiled element-tinted body + glow. */
export function loongPlaceholder(tint: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: tint,
    emissive: tint,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.3,
  });
  const body = new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.16, 80, 12, 2, 3), mat);
  body.position.y = 1.0;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), mat);
  head.position.y = 1.7;
  head.castShadow = true;
  g.add(head);
  const light = new THREE.PointLight(tint, 1.2, 4);
  light.position.y = 1.2;
  g.add(light);
  return g;
}

export async function loadUnitModel(unit: UnitDef): Promise<THREE.Group> {
  const ref: ModelRef = unit.model;
  if (ref.kind === 'glb' && ref.src) {
    try {
      const model = await loadGLB(ref.src);
      if (ref.tint) applyElementGlow(model, ref.tint);
      return model;
    } catch (err) {
      console.warn(`[models] failed to load ${ref.src}, using placeholder`, err);
      return loongPlaceholder(ref.tint ?? 0x888888);
    }
  }
  return loongPlaceholder(ref.tint ?? 0x888888);
}

/** Subtle element-colored rim emissive so units read by element at a glance. */
function applyElementGlow(obj: THREE.Object3D, tint: number): void {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if ('emissive' in std) {
          std.emissive = new THREE.Color(tint);
          std.emissiveIntensity = 0.12;
        }
      }
    }
  });
}

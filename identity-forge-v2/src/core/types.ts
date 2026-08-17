/**
 * MATHEMATICALLY HARDENED TYPES
 * Identity Forge v2.0 — Core Type Definitions
 *
 * All coordinates bounded, all transforms stable, all states projected
 * onto the feasible set Ω.
 */

// ─── Core Vector Types ────────────────────────────────────────────────────────

export type Vector5D = readonly [number, number, number, number, number];

export type Vector3D = readonly [number, number, number];

export type MorphWeights = Record<string, number>;

// ─── Bounded State Model ─────────────────────────────────────────────────────

export interface BoundedState {
  grid: Vector5D[];
  morph: MorphWeights;
  reflection: ReflectionState;
  animation: AnimationState;
  picture: PictureState;
}

export interface ReflectionState {
  intensity: number; // [0, 1]
  depth: number; // [0, 1]
  quality: 'low' | 'medium' | 'high' | 'ultra';
  matrix: Float32Array; // 5x5 orthogonal
}

export interface AnimationState {
  frames: FrameData[];
  currentFrame: number;
  fps: number; // [1, 120]
  isPlaying: boolean;
  time: number;
}

export interface PictureState {
  imageData: ImageData | null;
  depthMap: Float32Array;
  reflectionMap: Float32Array;
  transform: Transform5D;
}

export interface Transform5D {
  matrix: Float32Array; // 5x5 with ||S||₂ ≤ 1
  translation: Vector5D;
}

export interface FrameData {
  id: string;
  image: string;
  duration: number;
  transition: TransitionType;
  metadata: FrameMetadata;
}

export interface FrameMetadata {
  x: number;
  y: number;
  z: number;
  w: number;
  v: number;
  depth: number;
  reflection: number;
}

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'morph' | '5d';

// ─── Yee Lattice Types ───────────────────────────────────────────────────────

export interface YeeLatticePoint {
  x: number;
  y: number;
  z: number;
  w: number;  // 4th dimension (time/reflection)
  v: number;  // 5th dimension (probability/amplitude)
  morphId: string;
  intensity: number;
  weight: number;
}

export interface YeeLatticeConfig {
  resolution: number;
  dimensions: number;
  morphTargets: string[];
  reflectionDepth: number;
  animationFrames: number;
}

export interface HardenedLatticeConfig {
  resolution: number;
  morphTargets: string[];
  beta: number; // Softmax temperature
  seed: number;
  maxEnergy: number;
}

export interface LatticePoint {
  position: Vector5D;
  morphId: string;
  intensity: number;
  weight: number;
}

// ─── Morph Target Types ──────────────────────────────────────────────────────

export interface MorphTarget {
  id: string;
  name: string;
  weight: number;
  min: number;
  max: number;
  default: number;
  vertices: Float32Array;
  normals: Float32Array;
  tangents: Float32Array;
}

export interface MorphKey {
  targetId: string;
  weight: number;
  blendMode: 'additive' | 'average' | 'weighted';
}

// ─── Slide Animation Types ───────────────────────────────────────────────────

export interface SlideFrame {
  id: string;
  image: string; // base64 or URL
  duration: number; // seconds
  transition: TransitionType;
  metadata: FrameMetadata;
}

export interface SlideAnimation {
  id: string;
  name: string;
  frames: SlideFrame[];
  fps: number;
  loop: boolean;
  duration: number;
  transitionStyle: TransitionType;
  smoothnessLambda: number;
}

export interface HardenedAnimation {
  id: string;
  name: string;
  frames: FrameData[];
  fps: number;
  loop: boolean;
  duration: number;
  transitionStyle: TransitionType;
  smoothnessLambda: number;
}

// ─── Digital Mirror Types ────────────────────────────────────────────────────

export interface MirrorFrame {
  id: string;
  source: ImageData;
  reflected: ImageData;
  transform: {
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
  };
  metadata: {
    timestamp: number;
    quality: number;
    depth: number;
  };
}

export interface PictureData {
  id: string;
  image: HTMLImageElement;
  processed: ImageData;
  depthMap: Float32Array;
  reflectionMap: Float32Array;
  metadata: {
    width: number;
    height: number;
    depth: number;
    reflection: number;
    timestamp: number;
  };
}

// ─── 5D Transform Types ──────────────────────────────────────────────────────

export interface Transform5DConfig {
  matrix: Float32Array;
  translation: [number, number, number, number, number];
  rotation: [number, number, number, number, number];
  scale: [number, number, number, number, number];
}

// ─── Energy Configuration ────────────────────────────────────────────────────

export interface EnergyConfig {
  lambdaGrid: number;
  lambdaMorph: number;
  lambdaAnim: number;
  lambdaReflect: number;
  maxEnergy: number;
}

export const DEFAULT_ENERGY_CONFIG: EnergyConfig = {
  lambdaGrid: 0.25,
  lambdaMorph: 0.25,
  lambdaAnim: 0.25,
  lambdaReflect: 0.25,
  maxEnergy: 10.0,
};

// ─── Frame Renderer Types ───────────────────────────────────────────────────

export interface FrameRenderConfig {
  width: number;
  height: number;
  depth: number;
  reflection: boolean;
  morph: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// ─── Clamping Functions ──────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampVector5D(v: readonly number[]): Vector5D {
  return [
    clamp(v[0], -1, 1),
    clamp(v[1], -1, 1),
    clamp(v[2], -1, 1),
    clamp(v[3], -1, 1),
    clamp(v[4], -1, 1),
  ] as const;
}

export function clampMorphWeights(weights: MorphWeights): MorphWeights {
  const result: MorphWeights = {};
  for (const [key, value] of Object.entries(weights)) {
    result[key] = clamp(value, 0, 1);
  }
  return result;
}

export function normalizeWeights(weights: MorphWeights, epsilon: number = 1e-8): MorphWeights {
  const result: MorphWeights = {};
  let total = 0;
  for (const w of Object.values(weights)) {
    total += Math.max(0, w);
  }
  if (total > epsilon) {
    for (const [key, w] of Object.entries(weights)) {
      result[key] = Math.max(0, w) / total;
    }
  }
  return result;
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

export class SeededPRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  reseed(seed: number): void {
    this.seed = seed >>> 0;
  }
}

// ─── Energy Functions ───────────────────────────────────────────────────────

export function computeGridEnergy(grid: Vector5D[]): number {
  let energy = 0;
  for (const p of grid) {
    const clamped = clampVector5D(p);
    for (let i = 0; i < 5; i++) {
      energy += (p[i] - clamped[i]) ** 2;
    }
  }
  return energy;
}

export function computeMorphEnergy(weights: MorphWeights): number {
  let energy = 0;
  for (const w of Object.values(weights)) {
    energy += (w - 0.5) ** 2;
  }
  return energy;
}

export function computeAnimationEnergy(frames: FrameData[]): number {
  let energy = 0;
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1].metadata;
    const b = frames[i].metadata;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    const dw = a.w - b.w;
    const dv = a.v - b.v;
    energy += dx * dx + dy * dy + dz * dz + dw * dw + dv * dv;
  }
  return energy;
}

export function computeTotalEnergy(
  state: BoundedState,
  config: EnergyConfig = DEFAULT_ENERGY_CONFIG
): number {
  return (
    config.lambdaGrid * computeGridEnergy(state.grid) +
    config.lambdaMorph * computeMorphEnergy(state.morph) +
    config.lambdaAnim * computeAnimationEnergy(state.animation.frames) +
    config.lambdaReflect * state.reflection.intensity
  );
}

// ─── Matrix Utilities ───────────────────────────────────────────────────────

export function createIdentityMatrix5D(): Float32Array {
  const m = new Float32Array(25);
  for (let i = 0; i < 5; i++) {
    m[i * 5 + i] = 1;
  }
  return m;
}

export function isOrthogonal(matrix: Float32Array, tolerance: number = 1e-6): boolean {
  // Check R^T R ≈ I
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      let dot = 0;
      for (let k = 0; k < 5; k++) {
        dot += matrix[k * 5 + i] * matrix[k * 5 + j];
      }
      const expected = i === j ? 1 : 0;
      if (Math.abs(dot - expected) > tolerance) return false;
    }
  }
  return true;
}

export function operatorNorm(matrix: Float32Array): number {
  // Approximate operator norm using power iteration
  let v = new Float32Array([1, 0, 0, 0, 0]);
  for (let iter = 0; iter < 20; iter++) {
    const w = new Float32Array(5);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        w[i] += matrix[i * 5 + j] * v[j];
      }
    }
    let norm = 0;
    for (let i = 0; i < 5; i++) norm += w[i] * w[i];
    norm = Math.sqrt(norm);
    if (norm < 1e-10) break;
    for (let i = 0; i < 5; i++) v[i] = w[i] / norm;
  }
  // Compute ||Mv||
  let result = 0;
  for (let i = 0; i < 5; i++) {
    let sum = 0;
    for (let j = 0; j < 5; j++) {
      sum += matrix[i * 5 + j] * v[j];
    }
    result += sum * sum;
  }
  return Math.sqrt(result);
}

// ─── Interpolation ──────────────────────────────────────────────────────────

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function cubicHermite(t: number): number {
  return 2 * t * t * t - 3 * t * t + 1;
}

export function hermiteInterpolation(
  p0: number, m0: number, p1: number, m1: number, t: number
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
}

// ─── Lipschitz Check ────────────────────────────────────────────────────────

export function lipschitzConstant(
  f: (x: number) => number,
  range: [number, number],
  samples: number = 1000
): number {
  let maxSlope = 0;
  const [a, b] = range;
  const step = (b - a) / samples;
  let prev = f(a);
  for (let i = 1; i <= samples; i++) {
    const x = a + i * step;
    const curr = f(x);
    const slope = Math.abs(curr - prev) / step;
    if (slope > maxSlope) maxSlope = slope;
    prev = curr;
  }
  return maxSlope;
}

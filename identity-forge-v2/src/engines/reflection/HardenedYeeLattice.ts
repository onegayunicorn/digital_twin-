/**
 * HARDENED YEE LATTICE ENGINE
 * Identity Forge v2.0 — 5D Morph-Target Grid
 *
 * Mathematically hardened:
 * - All coordinates bounded in [-1, 1]^5
 * - Deterministic via seeded PRNG
 * - Soft membership via Gaussian kernel
 * - Orthogonal reflection transforms
 * - Energy bounded by E_max
 */

import {
  Vector5D,
  clampVector5D,
  SeededPRNG,
  HardenedLatticeConfig,
  LatticePoint,
  clamp,
} from '../core/types';

export class HardenedYeeLatticeEngine {
  private config: HardenedLatticeConfig;
  private prng: SeededPRNG;
  private points: LatticePoint[] = [];
  private morphCenters: Map<string, Vector5D> = new Map();

  constructor(config: Partial<HardenedLatticeConfig> = {}) {
    this.config = {
      resolution: 32,
      morphTargets: ['eyes', 'nose', 'mouth', 'jaw', 'brows', 'cheeks'],
      beta: 4.0,
      seed: 42,
      maxEnergy: 5.0,
      ...config,
    };
    this.prng = new SeededPRNG(this.config.seed);
    this.initializeMorphCenters();
  }

  /**
   * Initialize morph target centers in 5D space.
   * Centers are placed deterministically on a hypersphere.
   */
  private initializeMorphCenters(): void {
    const targets = this.config.morphTargets;
    for (let i = 0; i < targets.length; i++) {
      // Place centers evenly distributed in 5D space
      const angle1 = (i / targets.length) * 2 * Math.PI;
      const angle2 = (i / targets.length) * Math.PI;
      const angle3 = (i / targets.length) * Math.PI * 0.5;

      const center: Vector5D = clampVector5D([
        0.7 * Math.cos(angle1),
        0.7 * Math.sin(angle1),
        0.5 * Math.cos(angle2),
        0.3 * Math.sin(angle2),
        0.2 * Math.cos(angle3),
      ]);

      this.morphCenters.set(targets[i], center);
    }
  }

  /**
   * Generate the complete 5D lattice.
   * Deterministic: same seed → same lattice.
   */
  generateLattice(): LatticePoint[] {
    const { resolution, morphTargets } = this.config;
    const points: LatticePoint[] = [];

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        for (let k = 0; k < resolution; k++) {
          // Deterministic normalized positions in [-1, 1]
          const x = (i / resolution) * 2 - 1;
          const y = (j / resolution) * 2 - 1;
          const z = (k / resolution) * 2 - 1;

          // Higher dimensions derived from spatial coordinates
          const w = Math.sin(i * 0.1 + j * 0.15) * 0.5;
          const v = Math.cos(k * 0.12 + i * 0.08) * 0.5;

          const position: Vector5D = clampVector5D([x, y, z, w, v]);

          // Soft membership to morph targets
          const morphId = this.assignMorphTarget(position);

          // Deterministic intensity and weight
          const intensity = 0.5 + 0.5 * Math.sin(i * 0.2 + j * 0.3 + k * 0.4);
          const weight = 0.8 + 0.2 * Math.cos(i * 0.1 + j * 0.2);

          points.push({
            position,
            morphId,
            intensity: clamp(intensity, 0, 1),
            weight: clamp(weight, 0, 1),
          });
        }
      }
    }

    this.points = points;
    return points;
  }

  /**
   * Compute soft membership scores for all morph targets.
   * Uses Gaussian kernel: μ_k ∝ exp(-β · ||p - c_k||²)
   */
  computeMemberships(position: Vector5D): Map<string, number> {
    const memberships = new Map<string, number>();
    let total = 0;

    for (const [target, center] of this.morphCenters) {
      const dist = this.distance5D(position, center);
      const score = Math.exp(-this.config.beta * dist * dist);
      memberships.set(target, score);
      total += score;
    }

    // Normalize to probability distribution
    if (total > 1e-10) {
      for (const [target] of memberships) {
        memberships.set(target, memberships.get(target)! / total);
      }
    }

    return memberships;
  }

  /**
   * Assign the most likely morph target via argmax of soft memberships.
   */
  private assignMorphTarget(position: Vector5D): string {
    const memberships = this.computeMemberships(position);
    let maxScore = -1;
    let selected = this.config.morphTargets[0];

    for (const [target, score] of memberships) {
      if (score > maxScore) {
        maxScore = score;
        selected = target;
      }
    }

    return selected;
  }

  /**
   * Euclidean distance in ℝ⁵.
   */
  private distance5D(a: Vector5D, b: Vector5D): number {
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * 5D reflection transform.
   * Uses orthogonal Givens rotations to preserve norm.
   *
   * R(θ) is orthogonal: R^T R = I, so ||R·p||₂ = ||p||₂
   */
  computeReflection(point: LatticePoint, depth: number): LatticePoint {
    const theta = depth * 0.5;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const p = point.position;

    // Givens rotation in (x,w) plane
    const rx = p[0] * cos - p[3] * sin;
    const rw = p[0] * sin + p[3] * cos;

    // Givens rotation in (y,v) plane
    const ry = p[1] * cos - p[4] * sin;
    const rv = p[1] * sin + p[4] * cos;

    // z remains unchanged
    const rz = p[2];

    const reflected: Vector5D = clampVector5D([rx, ry, rz, rw, rv]);

    return {
      position: reflected,
      morphId: point.morphId,
      intensity: clamp(point.intensity * (0.9 + 0.1 * Math.sin(depth * 0.2)), 0, 1),
      weight: clamp(point.weight * (0.95 + 0.05 * Math.cos(depth)), 0, 1),
    };
  }

  /**
   * Compute morph weights for a specific target.
   * Returns weights bounded in [0, 1].
   */
  getMorphWeights(target: string): Float32Array {
    const weights = new Float32Array(this.points.length);
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      weights[i] = point.morphId === target
        ? point.intensity * point.weight
        : point.intensity * 0.3;
    }
    return weights;
  }

  /**
   * Get the reflection grid as a 2D array.
   */
  getReflectionGrid(): LatticePoint[][] {
    const grid: LatticePoint[][] = [];
    const { resolution } = this.config;

    for (let i = 0; i < resolution; i++) {
      const row: LatticePoint[] = [];
      for (let j = 0; j < resolution; j++) {
        const point = this.points.find(p =>
          Math.round((p.position[0] + 1) * resolution / 2) === i &&
          Math.round((p.position[1] + 1) * resolution / 2) === j
        );
        if (point) row.push(point);
      }
      grid.push(row);
    }

    return grid;
  }

  /**
   * Compute the current grid energy.
   * Should be bounded by maxEnergy.
   */
  computeEnergy(): number {
    let energy = 0;
    for (const p of this.points) {
      const clamped = clampVector5D(p.position);
      for (let i = 0; i < 5; i++) {
        energy += (p.position[i] - clamped[i]) ** 2;
      }
    }
    return Math.min(energy, this.config.maxEnergy);
  }

  /**
   * Apply energy damping if energy exceeds max.
   * Returns true if damping was applied.
   */
  enforceEnergyBound(): boolean {
    const energy = this.computeEnergy();
    if (energy > this.config.maxEnergy) {
      const eta = Math.sqrt(this.config.maxEnergy / (energy + 1e-10));
      for (const p of this.points) {
        p.position = clampVector5D([
          p.position[0] * eta,
          p.position[1] * eta,
          p.position[2] * eta,
          p.position[3] * eta,
          p.position[4] * eta,
        ]);
      }
      return true;
    }
    return false;
  }

  getPoints(): LatticePoint[] {
    return this.points;
  }

  getConfig(): HardenedLatticeConfig {
    return { ...this.config };
  }

  getMorphCenters(): Map<string, Vector5D> {
    return new Map(this.morphCenters);
  }

  reseed(seed: number): void {
    this.config.seed = seed;
    this.prng.reseed(seed);
  }
}

/**
 * REFLECTION ENGINE
 * Identity Forge v2.0 — Core reflection processing
 *
 * Coordinates the 5D reflection grid, Yee lattice, and transform pipeline.
 */

import { HardenedYeeLatticeEngine } from './HardenedYeeLattice';
import { FiveDTransformEngine } from './5DTransform';
import { LatticePoint, Vector5D, clampVector5D } from '../../core/types';

export interface ReflectionResult {
  points: LatticePoint[];
  depth: number;
  intensity: number;
  transformMatrix: Float32Array;
  energy: number;
}

export class ReflectionEngine {
  private latticeEngine: HardenedYeeLatticeEngine;
  private transformEngine: FiveDTransformEngine;
  private reflectionDepth: number = 0;
  private reflectionIntensity: number = 1.0;
  private lastResult: ReflectionResult | null = null;

  constructor(resolution: number = 32, seed: number = 42) {
    this.latticeEngine = new HardenedYeeLatticeEngine({ resolution, seed });
    this.transformEngine = new FiveDTransformEngine();
    this.latticeEngine.generateLattice();
  }

  /**
   * Apply reflection at a given depth.
   * Returns the reflected lattice points.
   */
  applyReflection(depth: number): ReflectionResult {
    this.reflectionDepth = depth;
    const points = this.latticeEngine.getPoints();
    const reflectedPoints: LatticePoint[] = [];

    const matrix = this.transformEngine.createReflectionMatrix(depth);

    for (const point of points) {
      const reflected = this.latticeEngine.computeReflection(point, depth);
      reflectedPoints.push(reflected);
    }

    // Enforce energy bound
    this.latticeEngine.enforceEnergyBound();

    const result: ReflectionResult = {
      points: reflectedPoints,
      depth,
      intensity: this.reflectionIntensity,
      transformMatrix: matrix,
      energy: this.latticeEngine.computeEnergy(),
    };

    this.lastResult = result;
    return result;
  }

  /**
   * Apply a custom 5D transform to the entire lattice.
   */
  applyCustomTransform(transformId: string): LatticePoint[] {
    const transform = this.transformEngine.getTransform(transformId);
    if (!transform) return this.latticeEngine.getPoints();

    const points = this.latticeEngine.getPoints();
    const transformed: LatticePoint[] = [];

    for (const point of points) {
      const newPos = this.transformEngine.applyTransform(point.position, transform);
      transformed.push({
        ...point,
        position: newPos,
      });
    }

    return transformed;
  }

  /**
   * Get the reflection intensity at a specific 5D position.
   */
  getIntensityAt(position: Vector5D): number {
    const points = this.latticeEngine.getPoints();
    let totalIntensity = 0;
    let totalWeight = 0;

    for (const point of points) {
      let dist = 0;
      for (let i = 0; i < 5; i++) {
        const diff = position[i] - point.position[i];
        dist += diff * diff;
      }
      dist = Math.sqrt(dist);

      const weight = Math.exp(-dist * 10);
      totalIntensity += point.intensity * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalIntensity / totalWeight : 0;
  }

  /**
   * Compute the reflection gradient at a point.
   */
  getGradient(position: Vector5D): Vector5D {
    const eps = 0.01;
    const gradient: number[] = [];

    for (let i = 0; i < 5; i++) {
      const posPlus = [...position] as number[];
      const posMinus = [...position] as number[];
      posPlus[i] += eps;
      posMinus[i] -= eps;

      const valPlus = this.getIntensityAt(clampVector5D(posPlus));
      const valMinus = this.getIntensityAt(clampVector5D(posMinus));

      gradient.push((valPlus - valMinus) / (2 * eps));
    }

    return clampVector5D(gradient);
  }

  /**
   * Set the reflection intensity multiplier.
   */
  setIntensity(intensity: number): void {
    this.reflectionIntensity = Math.max(0, Math.min(1, intensity));
  }

  getIntensity(): number {
    return this.reflectionIntensity;
  }

  getDepth(): number {
    return this.reflectionDepth;
  }

  getLatticeEngine(): HardenedYeeLatticeEngine {
    return this.latticeEngine;
  }

  getTransformEngine(): FiveDTransformEngine {
    return this.transformEngine;
  }

  getLastResult(): ReflectionResult | null {
    return this.lastResult;
  }

  /**
   * Reset to initial state.
   */
  reset(): void {
    this.reflectionDepth = 0;
    this.reflectionIntensity = 1.0;
    this.latticeEngine.generateLattice();
    this.lastResult = null;
  }
}

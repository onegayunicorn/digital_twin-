/**
 * YEE LATTICE ENGINE — Original Implementation
 * Identity Forge v2.0 — 5D Morph-Target Grid
 *
 * Generates a 5D reflection grid for character morphing.
 * Backward-compatible interface. For hardened version see HardenedYeeLattice.
 */

import { YeeLatticePoint, YeeLatticeConfig } from '../../core/types';

export class YeeLatticeEngine {
  private lattice: YeeLatticePoint[] = [];
  private config: YeeLatticeConfig;

  constructor(config: Partial<YeeLatticeConfig> = {}) {
    this.config = {
      resolution: 32,
      dimensions: 5,
      morphTargets: ['eyes', 'nose', 'mouth', 'jaw', 'brows', 'cheeks'],
      reflectionDepth: 4,
      animationFrames: 60,
      ...config,
    };
  }

  generateLattice(): YeeLatticePoint[] {
    const points: YeeLatticePoint[] = [];
    const { resolution, morphTargets, reflectionDepth } = this.config;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        for (let k = 0; k < resolution; k++) {
          // Generate 5D point
          const x = (i / resolution) * 2 - 1;
          const y = (j / resolution) * 2 - 1;
          const z = (k / resolution) * 2 - 1;
          const w = Math.sin(i * 0.1 + j * 0.1) * reflectionDepth;
          const v = Math.cos(k * 0.1 + i * 0.1);

          // Map to morph target
          const morphIndex = Math.floor(Math.random() * morphTargets.length);
          const morphId = morphTargets[morphIndex];

          points.push({
            x, y, z, w, v,
            morphId,
            intensity: 0.5 + 0.5 * Math.sin(i * 0.2 + j * 0.3 + k * 0.4),
            weight: 0.8 + 0.2 * Math.cos(i * 0.1 + j * 0.2),
          });
        }
      }
    }

    this.lattice = points;
    return points;
  }

  getReflectionGrid(): YeeLatticePoint[][] {
    const grid: YeeLatticePoint[][] = [];
    const { resolution } = this.config;

    for (let i = 0; i < resolution; i++) {
      const row: YeeLatticePoint[] = [];
      for (let j = 0; j < resolution; j++) {
        const point = this.lattice.find(p =>
          Math.round(p.x * resolution / 2 + resolution / 2) === i &&
          Math.round(p.y * resolution / 2 + resolution / 2) === j
        );
        if (point) row.push(point);
      }
      grid.push(row);
    }

    return grid;
  }

  computeMorphWeights(target: string): Float32Array {
    const weights = new Float32Array(this.lattice.length);

    for (let i = 0; i < this.lattice.length; i++) {
      const point = this.lattice[i];
      weights[i] = point.morphId === target
        ? point.intensity * point.weight
        : point.intensity * 0.3;
    }

    return weights;
  }

  reflectPoint(point: YeeLatticePoint, depth: number): YeeLatticePoint {
    // 5D reflection transform
    const reflected = {
      ...point,
      x: point.x * Math.cos(depth * 0.1) - point.w * Math.sin(depth * 0.1),
      y: point.y * Math.cos(depth * 0.1) - point.v * Math.sin(depth * 0.1),
      z: point.z * Math.cos(depth * 0.1),
      w: point.x * Math.sin(depth * 0.1) + point.w * Math.cos(depth * 0.1),
      v: point.y * Math.sin(depth * 0.1) + point.v * Math.cos(depth * 0.1),
      intensity: point.intensity * (0.9 + 0.1 * Math.sin(depth * 0.2)),
    };

    return reflected;
  }

  getLattice(): YeeLatticePoint[] {
    return this.lattice;
  }

  getConfig(): YeeLatticeConfig {
    return this.config;
  }
}

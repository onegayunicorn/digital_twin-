import { describe, it, expect } from 'vitest';
import { HardenedYeeLatticeEngine } from '../../src/engines/reflection/HardenedYeeLattice';
import { clampVector5D, operatorNorm, createIdentityMatrix5D, isOrthogonal, computeMorphEnergy, computeAnimationEnergy, computeGridEnergy, computeTotalEnergy, DEFAULT_ENERGY_CONFIG } from '../../src/core/types';

describe('Mathematical Hardening Validation', () => {
  it('all coordinates bounded in [-1, 1]', () => {
    const engine = new HardenedYeeLatticeEngine({ resolution: 8 });
    const points = engine.generateLattice();
    for (const p of points) {
      for (let i = 0; i < 5; i++) {
        expect(p.position[i]).toBeGreaterThanOrEqual(-1.001);
        expect(p.position[i]).toBeLessThanOrEqual(1.001);
      }
    }
  });

  it('clampVector5D projects to [-1, 1]^5', () => {
    const testCases = [
      [[2, 2, 2, 2, 2], [1, 1, 1, 1, 1]],
      [[-2, -2, -2, -2, -2], [-1, -1, -1, -1, -1]],
      [[0.5, -0.3, 0, 1.5, -0.5], [0.5, -0.3, 0, 1, -0.5]],
    ];
    for (const [input, expected] of testCases) {
      const result = clampVector5D(input as number[]);
      for (let i = 0; i < 5; i++) {
        expect(result[i]).toBeCloseTo((expected as number[])[i], 4);
      }
    }
  });

  it('identity matrix has operator norm ≈ 1', () => {
    const identity = createIdentityMatrix5D();
    const norm = operatorNorm(identity);
    expect(norm).toBeCloseTo(1, 2);
  });

  it('identity matrix is orthogonal', () => {
    const identity = createIdentityMatrix5D();
    expect(isOrthogonal(identity)).toBe(true);
  });

  it('energy remains bounded', () => {
    const engine = new HardenedYeeLatticeEngine({ resolution: 8, maxEnergy: 5.0 });
    engine.generateLattice();
    const energy = engine.computeEnergy();
    expect(energy).toBeLessThanOrEqual(engine.getConfig().maxEnergy + 0.01);
  });

  it('computeMorphEnergy returns non-negative value', () => {
    const energy = computeMorphEnergy({ eyes: 0.5, nose: 0.5 });
    expect(energy).toBeGreaterThanOrEqual(0);
  });

  it('computeGridEnergy is zero for valid points', () => {
    const validPoints = [
      [0, 0, 0, 0, 0] as const,
      [0.5, -0.5, 1, -1, 0.3] as const,
    ];
    expect(computeGridEnergy(validPoints)).toBeCloseTo(0, 4);
  });

  it('computeGridEnergy is positive for invalid points', () => {
    const invalidPoints = [
      [2, 0, 0, 0, 0] as const,
    ];
    expect(computeGridEnergy(invalidPoints)).toBeGreaterThan(0);
  });

  it('total energy is bounded by maxEnergy', () => {
    const state = {
      grid: [[0, 0, 0, 0, 0] as const],
      morph: { eyes: 0.5 },
      reflection: { intensity: 0.5, depth: 0.5, quality: 'medium' as const, matrix: createIdentityMatrix5D() },
      animation: { frames: [], currentFrame: 0, fps: 30, isPlaying: false, time: 0 },
      picture: {
        imageData: null,
        depthMap: new Float32Array(),
        reflectionMap: new Float32Array(),
        transform: { matrix: createIdentityMatrix5D(), translation: [0, 0, 0, 0, 0] as const },
      },
    };
    const total = computeTotalEnergy(state, DEFAULT_ENERGY_CONFIG);
    expect(total).toBeLessThanOrEqual(DEFAULT_ENERGY_CONFIG.maxEnergy);
  });

  it('reflection preserves norm approximately', () => {
    const engine = new HardenedYeeLatticeEngine({ resolution: 4 });
    const points = engine.generateLattice();
    if (points.length > 0) {
      const point = points[0];
      const reflected = engine.computeReflection(point, 0.3);
      const origNorm = Math.sqrt(point.position.reduce((s, v) => s + v * v, 0));
      const refNorm = Math.sqrt(reflected.position.reduce((s, v) => s + v * v, 0));
      // Orthogonal transform should preserve norm (within tolerance for clamping)
      expect(refNorm).toBeGreaterThan(origNorm * 0.8);
      expect(refNorm).toBeLessThan(origNorm * 1.2);
    }
  });

  it('enforceEnergyBound works', () => {
    const engine = new HardenedYeeLatticeEngine({ resolution: 4, maxEnergy: 0.001 });
    engine.generateLattice();
    const damped = engine.enforceEnergyBound();
    expect(damped).toBe(true);
    const energy = engine.computeEnergy();
    expect(energy).toBeLessThanOrEqual(engine.getConfig().maxEnergy + 0.01);
  });
});

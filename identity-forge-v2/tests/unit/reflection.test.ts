import { describe, it, expect, beforeAll } from 'vitest';
import { YeeLatticeEngine } from '../../src/engines/reflection/YeeLatticeEngine';
import { HardenedYeeLatticeEngine } from '../../src/engines/reflection/HardenedYeeLatticeEngine';
import { FiveDTransformEngine } from '../../src/engines/reflection/5DTransform';
import { ReflectionEngine } from '../../src/engines/reflection/ReflectionEngine';
import { clampVector5D, SeededPRNG } from '../../src/core/types';

describe('Yee Lattice Engine', () => {
  it('generates lattice with correct dimensions', () => {
    const engine = new YeeLatticeEngine({ resolution: 8 });
    const lattice = engine.generateLattice();
    expect(lattice.length).toBe(8 * 8 * 8);
    expect(lattice[0]).toHaveProperty('x');
    expect(lattice[0]).toHaveProperty('y');
    expect(lattice[0]).toHaveProperty('z');
    expect(lattice[0]).toHaveProperty('w');
    expect(lattice[0]).toHaveProperty('v');
  });

  it('computes morph weights correctly', () => {
    const engine = new YeeLatticeEngine();
    engine.generateLattice();
    const weights = engine.computeMorphWeights('eyes');
    expect(weights.length).toBeGreaterThan(0);
    for (let i = 0; i < weights.length; i++) {
      expect(weights[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('reflects points in 5D', () => {
    const engine = new YeeLatticeEngine();
    const point = {
      x: 1, y: 0, z: 0, w: 0, v: 0,
      morphId: 'test',
      intensity: 0.5,
      weight: 0.5,
    };
    const reflected = engine.reflectPoint(point, 1);
    expect(reflected.w).not.toBeCloseTo(0, 2);
    expect(reflected.v).not.toBeCloseTo(0, 2);
  });
});

describe('Hardened Yee Lattice Engine', () => {
  let engine: HardenedYeeLatticeEngine;

  beforeAll(() => {
    engine = new HardenedYeeLatticeEngine({ resolution: 8, seed: 42 });
  });

  it('lattice points stay bounded in [-1, 1]^5', () => {
    const points = engine.generateLattice();
    for (const p of points) {
      for (let i = 0; i < 5; i++) {
        expect(p.position[i]).toBeGreaterThanOrEqual(-1);
        expect(p.position[i]).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is deterministic with same seed', () => {
    const engine1 = new HardenedYeeLatticeEngine({ resolution: 4, seed: 42 });
    const engine2 = new HardenedYeeLatticeEngine({ resolution: 4, seed: 42 });
    const points1 = engine1.generateLattice();
    const points2 = engine2.generateLattice();
    expect(points1.length).toBe(points2.length);
    for (let i = 0; i < points1.length; i++) {
      for (let j = 0; j < 5; j++) {
        expect(points1[i].position[j]).toBeCloseTo(points2[i].position[j], 6);
      }
    }
  });

  it('soft memberships sum to approximately 1', () => {
    const points = engine.generateLattice();
    if (points.length > 0) {
      const memberships = engine.computeMemberships(points[0].position);
      let total = 0;
      for (const score of memberships.values()) {
        total += score;
      }
      expect(total).toBeCloseTo(1, 4);
    }
  });

  it('reflection preserves norm approximately', () => {
    const points = engine.generateLattice();
    if (points.length > 0) {
      const point = points[0];
      const reflected = engine.computeReflection(point, 0.5);
      const origNorm = Math.sqrt(point.position.reduce((s, v) => s + v * v, 0));
      const refNorm = Math.sqrt(reflected.position.reduce((s, v) => s + v * v, 0));
      expect(refNorm).toBeLessThanOrEqual(origNorm * 1.1);
    }
  });

  it('clampVector5D works correctly', () => {
    const unbounded = [2, -3, 0.5, 1.5, -0.5] as const;
    const clamped = clampVector5D(unbounded);
    expect(clamped[0]).toBe(1);
    expect(clamped[1]).toBe(-1);
    expect(clamped[2]).toBeCloseTo(0.5);
    expect(clamped[3]).toBe(1);
    expect(clamped[4]).toBeCloseTo(-0.5);
  });
});

describe('5D Transform Engine', () => {
  const engine = new FiveDTransformEngine();

  it('creates identity transform by default', () => {
    const t = engine.createTransform('test');
    for (let i = 0; i < 5; i++) {
      expect(t.matrix[i * 5 + i]).toBe(1);
    }
  });

  it('reflectAcrossAxis flips the correct coordinate', () => {
    const point = [1, 2, 3, 4, 5] as const;
    const reflected = engine.reflectAcrossAxis(point, 0);
    expect(reflected[0]).toBe(-1);
    expect(reflected[1]).toBe(2);
  });

  it('createReflectionMatrix produces valid matrix', () => {
    const matrix = engine.createReflectionMatrix(0.5);
    expect(matrix.length).toBe(25);
  });
});

describe('Seeded PRNG', () => {
  it('produces deterministic output', () => {
    const rng1 = new SeededPRNG(42);
    const rng2 = new SeededPRNG(42);
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('different seeds produce different output', () => {
    const rng1 = new SeededPRNG(42);
    const rng2 = new SeededPRNG(123);
    expect(rng1.next()).not.toBe(rng2.next());
  });

  it('output is in [0, 1)', () => {
    const rng = new SeededPRNG(42);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('Reflection Engine', () => {
  it('applies reflection without errors', () => {
    const engine = new ReflectionEngine(8, 42);
    const result = engine.applyReflection(0.5);
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.depth).toBe(0.5);
    expect(result.energy).toBeDefined();
  });

  it('getIntensityAt returns value in [0, 1]', () => {
    const engine = new ReflectionEngine(8, 42);
    const intensity = engine.getIntensityAt([0, 0, 0, 0, 0]);
    expect(intensity).toBeGreaterThanOrEqual(0);
    expect(intensity).toBeLessThanOrEqual(1);
  });
});

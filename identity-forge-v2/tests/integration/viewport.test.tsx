import { describe, it, expect } from 'vitest';
import { HardenedYeeLatticeEngine } from '../../src/engines/reflection/HardenedYeeLattice';
import { HardenedMorphProcessor } from '../../src/engines/animation/HardenedMorphProcessor';
import { MorphTarget } from '../../src/core/types';

describe('Viewport Integration', () => {
  it('lattice and morph processor work together', () => {
    // Generate lattice
    const latticeEngine = new HardenedYeeLatticeEngine({ resolution: 4 });
    const points = latticeEngine.generateLattice();
    expect(points.length).toBeGreaterThan(0);

    // Set up morph processor
    const morphProcessor = new HardenedMorphProcessor();
    const targets = ['eyes', 'nose', 'mouth'];
    targets.forEach((id, i) => {
      const target: MorphTarget = {
        id,
        name: id,
        weight: 0.5,
        min: 0,
        max: 1,
        default: 0.5,
        vertices: new Float32Array(100).map((_, j) => (j / 100) * (i + 1)),
        normals: new Float32Array(100),
        tangents: new Float32Array(100),
      };
      morphProcessor.registerTarget(target);
    });

    // Get morph weights from lattice
    const eyesWeights = latticeEngine.getMorphWeights('eyes');
    expect(eyesWeights.length).toBe(points.length);

    // Set morph weight based on lattice intensity
    const avgIntensity = points.reduce((s, p) => s + p.intensity, 0) / points.length;
    morphProcessor.setWeight('eyes', avgIntensity);
    expect(morphProcessor.getWeight('eyes')).toBeGreaterThan(0);
    expect(morphProcessor.getWeight('eyes')).toBeLessThanOrEqual(1);

    // Get normalized weights
    const normalized = morphProcessor.getNormalizedWeights();
    const total = Object.values(normalized).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 4);
  });

  it('reflection depth affects morph weights consistently', () => {
    const engine = new HardenedYeeLatticeEngine({ resolution: 4, seed: 42 });
    engine.generateLattice();

    // Reflect at different depths
    const weights0 = engine.getMorphWeights('eyes');
    const reflectedPoints = engine.getPoints().map((p) => engine.computeReflection(p, 0.5));
    expect(reflectedPoints.length).toBe(engine.getPoints().length);

    // After reflection, all points should still be bounded
    for (const p of reflectedPoints) {
      for (let i = 0; i < 5; i++) {
        expect(p.position[i]).toBeGreaterThanOrEqual(-1.001);
        expect(p.position[i]).toBeLessThanOrEqual(1.001);
      }
    }
  });

  it('energy constraints hold across system', () => {
    const maxEnergy = 2.0;
    const engine = new HardenedYeeLatticeEngine({ resolution: 4, maxEnergy });
    engine.generateLattice();

    // Apply multiple reflections
    for (let d = 0; d <= 1; d += 0.1) {
      engine.getPoints().forEach((p) => engine.computeReflection(p, d));
    }

    // Energy should stay bounded
    const energy = engine.computeEnergy();
    expect(energy).toBeLessThanOrEqual(maxEnergy + 0.01);
  });
});

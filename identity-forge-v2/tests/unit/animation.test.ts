import { describe, it, expect } from 'vitest';
import { SlideSequencer } from '../../src/engines/animation/SlideSequencer';
import { HardenedSlideSequencer } from '../../src/engines/animation/HardenedSlideSequencer';
import { HardenedMorphProcessor } from '../../src/engines/animation/HardenedMorphProcessor';
import { MorphTarget } from '../../src/core/types';

describe('Slide Sequencer', () => {
  it('creates animation with frames', () => {
    const sequencer = new SlideSequencer();
    const frames = [
      { id: '1', image: 'test1', duration: 1, transition: 'fade' as const, metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0 } },
      { id: '2', image: 'test2', duration: 1, transition: 'slide' as const, metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0 } },
    ];
    const anim = sequencer.createAnimation('test', frames);
    expect(anim.frames.length).toBe(2);
    expect(anim.duration).toBe(2);
  });

  it('plays and stops animation', () => {
    const sequencer = new SlideSequencer();
    const frames = [
      { id: '1', image: 'test1', duration: 1, transition: 'fade' as const, metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0 } },
    ];
    sequencer.createAnimation('test', frames);
    sequencer.play(sequencer.getAnimations()[0].id);
    expect(sequencer.isPlaying).toBe(true);
    sequencer.stop();
    expect(sequencer.isPlaying).toBe(false);
  });
});

describe('Hardened Slide Sequencer', () => {
  it('interpolates frames for smoothness', () => {
    const sequencer = new HardenedSlideSequencer();
    const frames = [
      { id: '1', image: 'test1', duration: 1, transition: 'fade' as const, metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0 } },
      { id: '2', image: 'test2', duration: 1, transition: 'fade' as const, metadata: { x: 1, y: 1, z: 1, w: 1, v: 1, depth: 1, reflection: 1 } },
    ];
    const anim = sequencer.createAnimation('test', frames);
    expect(anim.frames.length).toBeGreaterThan(2); // Interpolation adds frames
  });

  it('fps is clamped to valid range', () => {
    const sequencer = new HardenedSlideSequencer();
    const anim = sequencer.createAnimation('test', [], { fps: 200 });
    expect(anim.fps).toBeLessThanOrEqual(120);
  });

  it('computeSmoothness returns non-negative value', () => {
    const sequencer = new HardenedSlideSequencer();
    const frames = [
      { id: '1', image: 'test1', duration: 1, transition: 'fade' as const, metadata: { x: 0, y: 0, z: 0, w: 0, v: 0, depth: 0, reflection: 0 } },
      { id: '2', image: 'test2', duration: 1, transition: 'fade' as const, metadata: { x: 1, y: 1, z: 1, w: 1, v: 1, depth: 1, reflection: 1 } },
    ];
    const anim = sequencer.createAnimation('test', frames);
    expect(sequencer.computeSmoothness(anim)).toBeGreaterThanOrEqual(0);
  });
});

describe('Hardened Morph Processor', () => {
  it('weights are clamped to valid range', () => {
    const processor = new HardenedMorphProcessor();
    const target: MorphTarget = {
      id: 'eyes',
      name: 'Eyes',
      weight: 0.5,
      min: 0,
      max: 1,
      default: 0.5,
      vertices: new Float32Array(10),
      normals: new Float32Array(10),
      tangents: new Float32Array(10),
    };
    processor.registerTarget(target);
    processor.setWeight('eyes', 2);
    expect(processor.getWeight('eyes')).toBe(1);
    processor.setWeight('eyes', -1);
    expect(processor.getWeight('eyes')).toBe(0);
  });

  it('normalized weights sum to 1', () => {
    const processor = new HardenedMorphProcessor();
    const targets: MorphTarget[] = [
      { id: 'eyes', name: 'Eyes', weight: 0.5, min: 0, max: 1, default: 0.5, vertices: new Float32Array(10), normals: new Float32Array(10), tangents: new Float32Array(10) },
      { id: 'nose', name: 'Nose', weight: 0.5, min: 0, max: 1, default: 0.5, vertices: new Float32Array(10), normals: new Float32Array(10), tangents: new Float32Array(10) },
    ];
    targets.forEach((t) => processor.registerTarget(t));
    processor.setWeight('eyes', 0.8);
    processor.setWeight('nose', 0.4);
    const normalized = processor.getNormalizedWeights();
    const total = Object.values(normalized).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 4);
  });

  it('regularization energy is non-negative', () => {
    const processor = new HardenedMorphProcessor();
    expect(processor.computeRegularizationEnergy()).toBeGreaterThanOrEqual(0);
  });

  it('projectToFeasibleSet keeps weights in valid range', () => {
    const processor = new HardenedMorphProcessor();
    const target: MorphTarget = {
      id: 'eyes',
      name: 'Eyes',
      weight: 0.5,
      min: 0,
      max: 1,
      default: 0.5,
      vertices: new Float32Array(10),
      normals: new Float32Array(10),
      tangents: new Float32Array(10),
    };
    processor.registerTarget(target);
    processor.setWeight('eyes', 0.7);
    processor.projectToFeasibleSet();
    const w = processor.getWeight('eyes');
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(1);
  });
});

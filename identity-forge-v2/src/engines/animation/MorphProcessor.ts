/**
 * MORPH TARGET PROCESSOR — Original Implementation
 * Identity Forge v2.0 — GLTF/GLB morph-target handling
 *
 * Backward-compatible interface.
 * For hardened version see HardenedMorphProcessor.
 */

import { MorphTarget, MorphKey } from '../../core/types';

export class MorphTargetProcessor {
  private targets: Map<string, MorphTarget> = new Map();
  private keyframes: Map<string, MorphKey[]> = new Map();

  registerTarget(target: MorphTarget): void {
    this.targets.set(target.id, target);
  }

  getTarget(id: string): MorphTarget | undefined {
    return this.targets.get(id);
  }

  setWeight(targetId: string, weight: number): void {
    const target = this.targets.get(targetId);
    if (target) {
      target.weight = Math.max(target.min, Math.min(target.max, weight));
    }
  }

  blendTargets(targetIds: string[], weights: number[]): Float32Array {
    const result = new Float32Array(1000); // placeholder
    let totalWeight = 0;

    for (let i = 0; i < targetIds.length; i++) {
      const target = this.targets.get(targetIds[i]);
      if (target) {
        const w = weights[i] || 1;
        totalWeight += w;
        for (let j = 0; j < result.length; j++) {
          result[j] += target.vertices[j] * w;
        }
      }
    }

    if (totalWeight > 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] /= totalWeight;
      }
    }

    return result;
  }

  createKeyframe(targetId: string, weight: number): MorphKey {
    return {
      targetId,
      weight,
      blendMode: 'additive',
    };
  }

  addKeyframe(name: string, key: MorphKey): void {
    if (!this.keyframes.has(name)) {
      this.keyframes.set(name, []);
    }
    this.keyframes.get(name)!.push(key);
  }

  getKeyframes(name: string): MorphKey[] {
    return this.keyframes.get(name) || [];
  }

  applyKeyframe(name: string, time: number): MorphKey | null {
    const keyframes = this.keyframes.get(name);
    if (!keyframes || keyframes.length === 0) return null;

    const index = Math.floor(time * keyframes.length) % keyframes.length;
    return keyframes[index];
  }

  getAllTargets(): MorphTarget[] {
    return Array.from(this.targets.values());
  }
}

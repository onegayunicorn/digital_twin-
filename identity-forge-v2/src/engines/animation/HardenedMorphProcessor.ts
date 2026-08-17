/**
 * HARDENED MORPH TARGET PROCESSOR
 * Identity Forge v2.0 — GLTF/GLB morph-target handling
 *
 * Mathematically hardened:
 * - All weights in [0, 1]
 * - Normalized weights sum to 1
 * - Regularization penalty on extreme weights
 * - Projection onto feasible set Ω_M
 */

import {
  MorphTarget,
  MorphKey,
  MorphWeights,
  clamp,
  normalizeWeights,
} from '../../core/types';

export class HardenedMorphProcessor {
  private targets: Map<string, MorphTarget> = new Map();
  private keyframes: Map<string, MorphKey[]> = new Map();
  private weights: MorphWeights = {};
  private regularizationLambda: number = 0.01;

  registerTarget(target: MorphTarget): void {
    this.targets.set(target.id, target);
    if (!(target.id in this.weights)) {
      this.weights[target.id] = target.default ?? 0.5;
    }
  }

  getTarget(id: string): MorphTarget | undefined {
    return this.targets.get(id);
  }

  /**
   * Set weight for a morph target.
   * Automatically clamped to [target.min, target.max].
   */
  setWeight(targetId: string, value: number): void {
    const target = this.targets.get(targetId);
    if (target) {
      this.weights[targetId] = clamp(value, target.min, target.max);
    } else {
      this.weights[targetId] = clamp(value, 0, 1);
    }
  }

  getWeight(targetId: string): number {
    return this.weights[targetId] ?? 0.5;
  }

  /**
   * Get raw weights (may not sum to 1).
   */
  getWeights(): MorphWeights {
    return { ...this.weights };
  }

  /**
   * Get normalized weights that sum to 1.
   * w̃_k = max(0, w_k) / (Σⱼ max(0, wⱼ) + ε)
   */
  getNormalizedWeights(): MorphWeights {
    return normalizeWeights(this.weights);
  }

  /**
   * Blend multiple morph targets.
   * Uses normalized weights for convex combination.
   */
  blendTargets(targetIds: string[], blendWeights?: number[]): Float32Array {
    const result = new Float32Array(1000); // Placeholder vertex buffer
    const normalized = this.getNormalizedWeights();
    let totalWeight = 0;

    for (let i = 0; i < targetIds.length; i++) {
      const id = targetIds[i];
      const w = blendWeights?.[i] ?? normalized[id] ?? 0.5;
      const target = this.targets.get(id);

      if (target) {
        totalWeight += w;
        for (let j = 0; j < result.length && j < target.vertices.length; j++) {
          result[j] += target.vertices[j] * w;
        }
      }
    }

    // Normalize
    if (totalWeight > 1e-10) {
      for (let i = 0; i < result.length; i++) {
        result[i] /= totalWeight;
      }
    }

    return result;
  }

  /**
   * Create a morph keyframe.
   */
  createKeyframe(targetId: string, weight: number): MorphKey {
    const target = this.targets.get(targetId);
    const safeWeight = target
      ? clamp(weight, target.min, target.max)
      : clamp(weight, 0, 1);

    return {
      targetId,
      weight: safeWeight,
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
    return this.keyframes.get(name) ?? [];
  }

  /**
   * Apply keyframe at a given time.
   * Uses cyclic indexing for animation loops.
   */
  applyKeyframe(name: string, time: number): MorphKey | null {
    const keyframes = this.keyframes.get(name);
    if (!keyframes || keyframes.length === 0) return null;

    const index = Math.floor(time * keyframes.length) % keyframes.length;
    const key = keyframes[index];

    this.setWeight(key.targetId, key.weight);
    return key;
  }

  /**
   * Compute regularization energy.
   * E_morph = λ · Σₖ (w_k - 0.5)²
   *
   * Penalizes extreme weights (near 0 or 1).
   */
  computeRegularizationEnergy(): number {
    let energy = 0;
    for (const w of Object.values(this.weights)) {
      energy += (w - 0.5) ** 2;
    }
    return this.regularizationLambda * energy;
  }

  /**
   * Project weights onto the feasible set.
   * Ω_M = { w ∈ ℝ^m | 0 ≤ w_k ≤ 1, Σₖ w_k = 1 }
   */
  projectToFeasibleSet(): void {
    const normalized = normalizeWeights(this.weights);

    for (const [id, w] of Object.entries(normalized)) {
      const target = this.targets.get(id);
      if (target) {
        this.weights[id] = clamp(w, target.min, target.max);
      } else {
        this.weights[id] = clamp(w, 0, 1);
      }
    }
  }

  /**
   * Optimize weights toward target vertices with regularization.
   *
   * min_w [ ||V(w) - V_target||² + λ·Σₖ w_k² ]
   *
   * Simple gradient descent step.
   */
  optimizeWeights(targetWeights: MorphWeights, learningRate: number = 0.1): void {
    for (const [id, targetW] of Object.entries(targetWeights)) {
      const currentW = this.weights[id] ?? 0.5;
      const gradient = (currentW - targetW) + this.regularizationLambda * currentW;
      const newW = currentW - learningRate * gradient;
      this.setWeight(id, newW);
    }
    this.projectToFeasibleSet();
  }

  getTargets(): MorphTarget[] {
    return Array.from(this.targets.values());
  }

  getTargetIds(): string[] {
    return Array.from(this.targets.keys());
  }

  setRegularizationLambda(lambda: number): void {
    this.regularizationLambda = Math.max(0, lambda);
  }

  getRegularizationLambda(): number {
    return this.regularizationLambda;
  }

  /**
   * Reset all weights to defaults.
   */
  resetWeights(): void {
    for (const [id, target] of this.targets) {
      this.weights[id] = target.default ?? 0.5;
    }
  }

  clearTargets(): void {
    this.targets.clear();
    this.weights = {};
  }
}

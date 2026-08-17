/**
 * 5D TRANSFORM ENGINE
 * Identity Forge v2.0 — Multi-dimensional reflection transforms
 *
 * Mathematically hardened:
 * - Operator norm bounded: ||S||₂ ≤ 1
 * - Orthogonal matrices preserve energy
 * - All results projected back to [-1, 1]^5
 */

import {
  Vector5D,
  Transform5DConfig,
  clampVector5D,
  createIdentityMatrix5D,
  isOrthogonal,
  operatorNorm,
  clamp,
} from '../../core/types';

export class FiveDTransformEngine {
  private transforms: Map<string, Transform5DConfig> = new Map();

  /**
   * Create a new transform with given configuration.
   * Automatically normalizes scale to ensure stability.
   */
  createTransform(id: string, config: Partial<Transform5DConfig> = {}): Transform5DConfig {
    const transform: Transform5DConfig = {
      matrix: createIdentityMatrix5D(),
      translation: [0, 0, 0, 0, 0],
      rotation: [0, 0, 0, 0, 0],
      scale: [1, 1, 1, 1, 1],
      ...config,
    };

    // Normalize scale to ensure ||S||₂ ≤ 1
    const maxScale = Math.max(...transform.scale.map(Math.abs), 1e-10);
    if (maxScale > 1) {
      for (let i = 0; i < 5; i++) {
        transform.scale[i] /= maxScale;
      }
    }

    this.transforms.set(id, transform);
    return transform;
  }

  /**
   * Apply a 5D transform to a point.
   * Result is clamped to [-1, 1]^5.
   *
   * T(p) = S·p + b, then Π(T(p))
   */
  applyTransform(point: readonly number[], transform: Transform5DConfig): Vector5D {
    const result = new Array(5).fill(0) as number[];

    // Apply matrix
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        result[i] += transform.matrix[i * 5 + j] * point[j];
      }
      // Apply scale
      result[i] *= transform.scale[i];
      // Apply translation
      result[i] += transform.translation[i];
    }

    return clampVector5D(result);
  }

  /**
   * Reflect a point across a specified axis.
   * Axis ∈ {0, 1, 2, 3, 4} for (x, y, z, w, v).
   */
  reflectAcrossAxis(point: readonly number[], axis: number): Vector5D {
    const result = [...point];
    const safeAxis = clamp(axis, 0, 4);
    result[safeAxis] = -result[safeAxis];
    return clampVector5D(result);
  }

  /**
   * 5D rotation using sequential Givens rotations.
   * Each pair of coordinates is rotated by angles[i].
   *
   * This produces an orthogonal matrix, so ||R·p||₂ = ||p||₂
   */
  rotate5D(point: readonly number[], angles: number[]): Vector5D {
    const result = [...point];

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 5; j++) {
        const angleIdx = Math.min(i, angles.length - 1);
        const angle = angles[angleIdx] || 0;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const a = result[i];
        const b = result[j];
        result[i] = a * cos - b * sin;
        result[j] = a * sin + b * cos;
      }
    }

    return clampVector5D(result);
  }

  /**
   * Create a 5D reflection matrix for a given depth.
   * The matrix is guaranteed orthogonal.
   */
  createReflectionMatrix(depth: number): Float32Array {
    const matrix = createIdentityMatrix5D();
    const theta = depth * 0.5;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Rotate in (x,w) plane
    matrix[0 * 5 + 0] = cos;
    matrix[0 * 5 + 3] = -sin;
    matrix[3 * 5 + 0] = sin;
    matrix[3 * 5 + 3] = cos;

    // Rotate in (y,v) plane
    matrix[1 * 5 + 1] = cos;
    matrix[1 * 5 + 4] = -sin;
    matrix[4 * 5 + 1] = sin;
    matrix[4 * 5 + 4] = cos;

    return matrix;
  }

  /**
   * Compose two transforms: T = T2 ∘ T1
   */
  composeTransforms(t1: Transform5DConfig, t2: Transform5DConfig): Transform5DConfig {
    const composed: Transform5DConfig = {
      matrix: createIdentityMatrix5D(),
      translation: [0, 0, 0, 0, 0],
      rotation: [0, 0, 0, 0, 0],
      scale: [1, 1, 1, 1, 1],
    };

    // Matrix multiplication: M = M2 · M1
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let sum = 0;
        for (let k = 0; k < 5; k++) {
          sum += t2.matrix[i * 5 + k] * t1.matrix[k * 5 + j];
        }
        composed.matrix[i * 5 + j] = sum;
      }
    }

    // Translation composition
    for (let i = 0; i < 5; i++) {
      let sum = 0;
      for (let j = 0; j < 5; j++) {
        sum += t2.matrix[i * 5 + j] * t1.translation[j];
      }
      composed.translation[i] = sum + t2.translation[i];
    }

    // Scale composition (element-wise product, then normalize)
    let maxScale = 0;
    for (let i = 0; i < 5; i++) {
      composed.scale[i] = t1.scale[i] * t2.scale[i];
      maxScale = Math.max(maxScale, Math.abs(composed.scale[i]));
    }
    if (maxScale > 1) {
      for (let i = 0; i < 5; i++) {
        composed.scale[i] /= maxScale;
      }
    }

    return composed;
  }

  /**
   * Validate that a transform satisfies stability constraints.
   */
  validateTransform(transform: Transform5DConfig): {
    valid: boolean;
    operatorNorm: number;
    orthogonal: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const opNorm = operatorNorm(transform.matrix);
    const orthogonal = isOrthogonal(transform.matrix);

    if (opNorm > 1.001) {
      issues.push(`Operator norm ${opNorm.toFixed(4)} exceeds 1`);
    }

    const maxScale = Math.max(...transform.scale.map(Math.abs));
    if (maxScale > 1.001) {
      issues.push(`Max scale ${maxScale.toFixed(4)} exceeds 1`);
    }

    for (let i = 0; i < 5; i++) {
      if (Math.abs(transform.translation[i]) > 2) {
        issues.push(`Translation[${i}] = ${transform.translation[i]} is large`);
      }
    }

    return {
      valid: issues.length === 0,
      operatorNorm: opNorm,
      orthogonal,
      issues,
    };
  }

  /**
   * Project a transform onto the stable set.
   * Ensures ||S||₂ ≤ 1 after projection.
   */
  projectToStable(transform: Transform5DConfig): Transform5DConfig {
    const result = { ...transform };
    const opNorm = operatorNorm(transform.matrix);

    if (opNorm > 1) {
      const eta = 1 / opNorm;
      for (let i = 0; i < 25; i++) {
        result.matrix[i] = transform.matrix[i] * eta;
      }
    }

    const maxScale = Math.max(...transform.scale.map(Math.abs), 1e-10);
    if (maxScale > 1) {
      for (let i = 0; i < 5; i++) {
        result.scale[i] = transform.scale[i] / maxScale;
      }
    }

    for (let i = 0; i < 5; i++) {
      result.translation[i] = clamp(transform.translation[i], -1, 1);
    }

    return result;
  }

  getTransform(id: string): Transform5DConfig | undefined {
    return this.transforms.get(id);
  }

  listTransforms(): string[] {
    return Array.from(this.transforms.keys());
  }

  deleteTransform(id: string): boolean {
    return this.transforms.delete(id);
  }

  clearTransforms(): void {
    this.transforms.clear();
  }
}

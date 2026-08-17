/**
 * DIGITAL MIRROR ENGINE
 * Identity Forge v2.0 — Real-time reflection processing
 *
 * Processes images through mirror reflection transforms:
 * - Horizontal mirror flip
 * - 5D depth-warped reflection
 * - Quality-preserving pixel operations
 * - Bounded transform parameters
 */

import { MirrorFrame, clamp } from '../../core/types';

export class DigitalMirrorEngine {
  private frames: MirrorFrame[] = [];
  private currentFrame: MirrorFrame | null = null;
  private maxFrames: number = 100;

  /**
   * Process an image through the digital mirror.
   * Applies horizontal reflection with optional transform parameters.
   */
  processImage(
    imageData: ImageData,
    options: Partial<MirrorFrame['transform']> = {}
  ): MirrorFrame {
    const { width, height, data } = imageData;
    const reflected = new ImageData(width, height);

    const transform = {
      scale: clamp(options.scale ?? 1, 0.1, 3),
      rotation: clamp(options.rotation ?? 0, -Math.PI, Math.PI),
      offsetX: clamp(options.offsetX ?? 0, -width, width),
      offsetY: clamp(options.offsetY ?? 0, -height, height),
    };

    // Apply mirror transform: horizontal flip + optional scale/offset
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Horizontal mirror: srcX = width - 1 - x
        let srcX = Math.floor((width - 1 - x) * transform.scale + transform.offsetX);
        let srcY = Math.floor(y * transform.scale + transform.offsetY);

        // Wrap/clamp source coordinates
        srcX = ((srcX % width) + width) % width;
        srcY = ((srcY % height) + height) % height;

        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        reflected.data[dstIdx] = data[srcIdx];
        reflected.data[dstIdx + 1] = data[srcIdx + 1];
        reflected.data[dstIdx + 2] = data[srcIdx + 2];
        reflected.data[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    const frame: MirrorFrame = {
      id: `mirror-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: imageData,
      reflected,
      transform,
      metadata: {
        timestamp: Date.now(),
        quality: this.computeQuality(reflected),
        depth: 0.5,
      },
    };

    this.storeFrame(frame);
    this.currentFrame = frame;
    return frame;
  }

  /**
   * Apply 5D reflection warp.
   * Uses sin/cos warping in higher dimensions.
   */
  apply5DReflection(frame: MirrorFrame, depth: number): MirrorFrame {
    const safeDepth = clamp(depth, 0, 1);
    const { width, height, data } = frame.reflected;
    const reflected5D = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 5D warp: offset based on position and depth
        const wOffset = Math.sin(x * 0.01 + safeDepth * 2 * Math.PI) * 10 * safeDepth;
        const vOffset = Math.cos(y * 0.01 + safeDepth * 2 * Math.PI) * 5 * safeDepth;

        let srcX = Math.floor(x + wOffset);
        let srcY = Math.floor(y + vOffset);

        srcX = ((srcX % width) + width) % width;
        srcY = ((srcY % height) + height) % height;

        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        reflected5D.data[dstIdx] = data[srcIdx];
        reflected5D.data[dstIdx + 1] = data[srcIdx + 1];
        reflected5D.data[dstIdx + 2] = data[srcIdx + 2];
        reflected5D.data[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    return {
      ...frame,
      reflected: reflected5D,
      metadata: {
        ...frame.metadata,
        depth: safeDepth,
      },
    };
  }

  /**
   * Apply a Gaussian blur to the reflected image.
   * Kernel is normalized to preserve brightness.
   */
  applyBlur(frame: MirrorFrame, radius: number = 2): MirrorFrame {
    const r = Math.max(0, Math.floor(radius));
    if (r === 0) return frame;

    const { width, height, data } = frame.reflected;
    const blurred = new ImageData(width, height);
    const kernelSize = 2 * r + 1;
    const kernel = this.createGaussianKernel(r);

    // Horizontal pass
    const horizontal = new Uint8ClampedArray(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0, wSum = 0;
        for (let k = -r; k <= r; k++) {
          const px = Math.max(0, Math.min(width - 1, x + k));
          const idx = (y * width + px) * 4;
          const w = kernel[k + r];
          rSum += data[idx] * w;
          gSum += data[idx + 1] * w;
          bSum += data[idx + 2] * w;
          aSum += data[idx + 3] * w;
          wSum += w;
        }
        const dstIdx = (y * width + x) * 4;
        horizontal[dstIdx] = rSum / wSum;
        horizontal[dstIdx + 1] = gSum / wSum;
        horizontal[dstIdx + 2] = bSum / wSum;
        horizontal[dstIdx + 3] = aSum / wSum;
      }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0, wSum = 0;
        for (let k = -r; k <= r; k++) {
          const py = Math.max(0, Math.min(height - 1, y + k));
          const idx = (py * width + x) * 4;
          const w = kernel[k + r];
          rSum += horizontal[idx] * w;
          gSum += horizontal[idx + 1] * w;
          bSum += horizontal[idx + 2] * w;
          aSum += horizontal[idx + 3] * w;
          wSum += w;
        }
        const dstIdx = (y * width + x) * 4;
        blurred.data[dstIdx] = rSum / wSum;
        blurred.data[dstIdx + 1] = gSum / wSum;
        blurred.data[dstIdx + 2] = bSum / wSum;
        blurred.data[dstIdx + 3] = aSum / wSum;
      }
    }

    return {
      ...frame,
      reflected: blurred,
    };
  }

  private createGaussianKernel(radius: number): number[] {
    const size = 2 * radius + 1;
    const kernel: number[] = [];
    const sigma = radius / 2;
    let sum = 0;

    for (let i = 0; i < size; i++) {
      const x = i - radius;
      const value = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel.push(value);
      sum += value;
    }

    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
  }

  /**
   * Compute image quality metric based on edge sharpness.
   * Returns value in [0, 1].
   */
  private computeQuality(imageData: ImageData): number {
    const { width, height, data } = imageData;
    let edgeSum = 0;
    let count = 0;

    // Simple edge detection via Sobel-like gradient
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const right = ((y * width + x + 1) * 4);
        const bottom = (((y + 1) * width + x) * 4);

        const gx = data[right] - data[idx];
        const gy = data[bottom] - data[idx];
        const grad = Math.sqrt(gx * gx + gy * gy);

        edgeSum += grad;
        count++;
      }
    }

    const avgGrad = count > 0 ? edgeSum / count : 0;
    return Math.min(1, avgGrad / 50); // Normalize to [0, 1]
  }

  private storeFrame(frame: MirrorFrame): void {
    this.frames.push(frame);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  getCurrentFrame(): MirrorFrame | null {
    return this.currentFrame;
  }

  getFrames(): MirrorFrame[] {
    return [...this.frames];
  }

  getFrameCount(): number {
    return this.frames.length;
  }

  clearFrames(): void {
    this.frames = [];
    this.currentFrame = null;
  }

  setMaxFrames(max: number): void {
    this.maxFrames = Math.max(1, max);
    while (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  exportFrame(frameId: string): string {
    const frame = this.frames.find(f => f.id === frameId);
    if (!frame) return '{}';
    return JSON.stringify({
      id: frame.id,
      transform: frame.transform,
      metadata: frame.metadata,
    });
  }
}

/**
 * REFLECTION FILTER
 * Identity Forge v2.0 — Image reflection filter pipeline
 *
 * A composable filter system for reflection processing:
 * - Kernel-based convolution filters
 * - Color space transforms
 * - Edge enhancement
 * - Normalization and clamping
 */

export type FilterKernel = number[][];

export interface FilterConfig {
  brightness: number;      // [-255, 255]
  contrast: number;        // [0.1, 3]
  saturation: number;      // [0, 2]
  blurRadius: number;      // [0, 10]
  edgeStrength: number;    // [0, 2]
  reflectionMix: number;   // [0, 1]
}

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  brightness: 0,
  contrast: 1,
  saturation: 1,
  blurRadius: 0,
  edgeStrength: 0.5,
  reflectionMix: 0.8,
};

export class ReflectionFilter {
  private config: FilterConfig;

  constructor(config: Partial<FilterConfig> = {}) {
    this.config = { ...DEFAULT_FILTER_CONFIG, ...config };
  }

  /**
   * Apply the complete filter pipeline to an image.
   */
  apply(imageData: ImageData): ImageData {
    let result = imageData;

    // 1. Blur (if radius > 0)
    if (this.config.blurRadius > 0) {
      result = this.applyBlur(result, this.config.blurRadius);
    }

    // 2. Brightness/contrast
    result = this.adjustBrightnessContrast(
      result,
      this.config.brightness,
      this.config.contrast
    );

    // 3. Saturation
    result = this.adjustSaturation(result, this.config.saturation);

    // 4. Edge enhancement
    if (this.config.edgeStrength > 0) {
      result = this.enhanceEdges(result, this.config.edgeStrength);
    }

    return result;
  }

  /**
   * Apply convolution with a kernel.
   * Kernel is normalized to preserve brightness.
   */
  convolve(imageData: ImageData, kernel: FilterKernel): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const kSize = kernel.length;
    const kHalf = Math.floor(kSize / 2);

    // Normalize kernel
    let kernelSum = 0;
    for (let i = 0; i < kSize; i++) {
      for (let j = 0; j < kSize; j++) {
        kernelSum += kernel[i][j];
      }
    }
    if (Math.abs(kernelSum) < 1e-10) kernelSum = 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const px = Math.max(0, Math.min(width - 1, x + kx - kHalf));
            const py = Math.max(0, Math.min(height - 1, y + ky - kHalf));
            const idx = (py * width + px) * 4;
            const w = kernel[ky][kx] / kernelSum;

            r += data[idx] * w;
            g += data[idx + 1] * w;
            b += data[idx + 2] * w;
          }
        }

        const dstIdx = (y * width + x) * 4;
        result.data[dstIdx] = this.clampByte(r);
        result.data[dstIdx + 1] = this.clampByte(g);
        result.data[dstIdx + 2] = this.clampByte(b);
        result.data[dstIdx + 3] = data[dstIdx + 3];
      }
    }

    return result;
  }

  /**
   * Gaussian blur filter.
   */
  applyBlur(imageData: ImageData, radius: number): ImageData {
    const r = Math.max(0, Math.floor(radius));
    if (r === 0) return imageData;

    const sigma = Math.max(0.5, r / 2);
    const size = 2 * r + 1;
    const kernel: FilterKernel = [];

    // Build Gaussian kernel
    for (let i = 0; i < size; i++) {
      kernel[i] = [];
      for (let j = 0; j < size; j++) {
        const x = i - r;
        const y = j - r;
        kernel[i][j] = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      }
    }

    return this.convolve(imageData, kernel);
  }

  /**
   * Sharpen filter using Laplacian kernel.
   */
  applySharpen(imageData: ImageData, strength: number = 1): ImageData {
    const s = Math.max(0, strength);
    const center = 1 + 4 * s;
    const kernel: FilterKernel = [
      [0, -s, 0],
      [-s, center, -s],
      [0, -s, 0],
    ];
    return this.convolve(imageData, kernel);
  }

  /**
   * Edge detection using Sobel operator.
   * Returns edge magnitude image.
   */
  detectEdges(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);

    const sobelX: FilterKernel = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    const sobelY: FilterKernel = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gxR = 0, gxG = 0, gxB = 0;
        let gyR = 0, gyG = 0, gyB = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const wx = sobelX[ky + 1][kx + 1];
            const wy = sobelY[ky + 1][kx + 1];

            gxR += data[idx] * wx;
            gxG += data[idx + 1] * wx;
            gxB += data[idx + 2] * wx;

            gyR += data[idx] * wy;
            gyG += data[idx + 1] * wy;
            gyB += data[idx + 2] * wy;
          }
        }

        const dstIdx = (y * width + x) * 4;
        const magR = Math.sqrt(gxR * gxR + gyR * gyR);
        const magG = Math.sqrt(gxG * gxG + gyG * gyG);
        const magB = Math.sqrt(gxB * gxB + gyB * gyB);

        result.data[dstIdx] = this.clampByte(magR);
        result.data[dstIdx + 1] = this.clampByte(magG);
        result.data[dstIdx + 2] = this.clampByte(magB);
        result.data[dstIdx + 3] = 255;
      }
    }

    return result;
  }

  /**
   * Enhance edges by adding edge signal back to original.
   */
  enhanceEdges(imageData: ImageData, strength: number): ImageData {
    const edges = this.detectEdges(imageData);
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const s = Math.max(0, Math.min(2, strength));

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      result.data[idx] = this.clampByte(data[idx] + edges.data[idx] * s * 0.3);
      result.data[idx + 1] = this.clampByte(data[idx + 1] + edges.data[idx + 1] * s * 0.3);
      result.data[idx + 2] = this.clampByte(data[idx + 2] + edges.data[idx + 2] * s * 0.3);
      result.data[idx + 3] = data[idx + 3];
    }

    return result;
  }

  /**
   * Adjust brightness and contrast.
   */
  adjustBrightnessContrast(
    imageData: ImageData,
    brightness: number,
    contrast: number
  ): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const b = this.clamp(brightness, -255, 255);
    const c = this.clamp(contrast, 0.1, 3);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      for (let ch = 0; ch < 3; ch++) {
        result.data[idx + ch] = this.clampByte(
          (data[idx + ch] - 128) * c + 128 + b
        );
      }
      result.data[idx + 3] = data[idx + 3];
    }

    return result;
  }

  /**
   * Adjust color saturation.
   * saturation = 0 → grayscale, 1 → original, >1 → boosted
   */
  adjustSaturation(imageData: ImageData, saturation: number): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const s = Math.max(0, saturation);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      result.data[idx] = this.clampByte(gray + (r - gray) * s);
      result.data[idx + 1] = this.clampByte(gray + (g - gray) * s);
      result.data[idx + 2] = this.clampByte(gray + (b - gray) * s);
      result.data[idx + 3] = data[idx + 3];
    }

    return result;
  }

  /**
   * Convert to grayscale.
   */
  toGrayscale(imageData: ImageData): ImageData {
    return this.adjustSaturation(imageData, 0);
  }

  /**
   * Invert colors.
   */
  invert(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      result.data[idx] = 255 - data[idx];
      result.data[idx + 1] = 255 - data[idx + 1];
      result.data[idx + 2] = 255 - data[idx + 2];
      result.data[idx + 3] = data[idx + 3];
    }

    return result;
  }

  /**
   * Mix two images together.
   * result = a * (1 - t) + b * t
   */
  mix(imageA: ImageData, imageB: ImageData, t: number): ImageData {
    const { width, height, data } = imageA;
    const result = new ImageData(width, height);
    const mixT = this.clamp(t, 0, 1);

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      for (let ch = 0; ch < 4; ch++) {
        result.data[idx + ch] = this.clampByte(
          data[idx + ch] * (1 - mixT) + imageB.data[idx + ch] * mixT
        );
      }
    }

    return result;
  }

  updateConfig(config: Partial<FilterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): FilterConfig {
    return { ...this.config };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private clampByte(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
  }
}

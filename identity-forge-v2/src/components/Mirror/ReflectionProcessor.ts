import { ReflectionFilter, FilterConfig, DEFAULT_FILTER_CONFIG } from '../../engines/mirror/ReflectionFilter';

/**
 * ReflectionProcessor — Higher-level image reflection processing
 * Composes the ReflectionFilter with DigitalMirrorEngine for pipeline processing
 */

export interface ProcessOptions {
  filterConfig?: Partial<FilterConfig>;
  apply5D?: boolean;
  depth?: number;
  mirrorHorizontal?: boolean;
}

export interface ProcessResult {
  original: ImageData;
  processed: ImageData;
  reflected: ImageData;
  config: FilterConfig;
  quality: number;
}

export class ReflectionProcessor {
  private filter: ReflectionFilter;

  constructor(config: Partial<FilterConfig> = {}) {
    this.filter = new ReflectionFilter(config);
  }

  /**
   * Process an image through the complete reflection pipeline.
   */
  process(imageData: ImageData, options: ProcessOptions = {}): ProcessResult {
    const config = { ...DEFAULT_FILTER_CONFIG, ...options.filterConfig };
    this.filter.updateConfig(config);

    // Step 1: Apply filter pipeline
    const processed = this.filter.apply(imageData);

    // Step 2: Apply horizontal mirror reflection
    let reflected = processed;
    if (options.mirrorHorizontal !== false) {
      reflected = this.mirrorHorizontal(processed);
    }

    // Step 3: Apply 5D warp if requested
    if (options.apply5D && options.depth) {
      reflected = this.apply5DWarp(reflected, options.depth);
    }

    return {
      original: imageData,
      processed,
      reflected,
      config,
      quality: this.estimateQuality(reflected),
    };
  }

  /**
   * Horizontal mirror flip.
   */
  private mirrorHorizontal(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = width - 1 - x;
        const srcIdx = (y * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        result.data[dstIdx] = data[srcIdx];
        result.data[dstIdx + 1] = data[srcIdx + 1];
        result.data[dstIdx + 2] = data[srcIdx + 2];
        result.data[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    return result;
  }

  /**
   * 5D coordinate warp using sin/cos offsets.
   */
  private apply5DWarp(imageData: ImageData, depth: number): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const safeDepth = Math.max(0, Math.min(1, depth));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const wOffset = Math.sin(x * 0.02 + safeDepth * 2 * Math.PI) * 8 * safeDepth;
        const vOffset = Math.cos(y * 0.02 + safeDepth * 2 * Math.PI) * 4 * safeDepth;

        let srcX = Math.floor(x + wOffset);
        let srcY = Math.floor(y + vOffset);

        srcX = ((srcX % width) + width) % width;
        srcY = ((srcY % height) + height) % height;

        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * width + x) * 4;

        result.data[dstIdx] = data[srcIdx];
        result.data[dstIdx + 1] = data[srcIdx + 1];
        result.data[dstIdx + 2] = data[srcIdx + 2];
        result.data[dstIdx + 3] = data[srcIdx + 3];
      }
    }

    return result;
  }

  /**
   * Estimate output quality based on edge sharpness.
   */
  private estimateQuality(imageData: ImageData): number {
    const { width, height, data } = imageData;
    let edgeSum = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const right = (y * width + x + 1) * 4;
        const bottom = ((y + 1) * width + x) * 4;

        const gx = Math.abs(data[right] - data[idx]);
        const gy = Math.abs(data[bottom] - data[idx]);
        edgeSum += Math.sqrt(gx * gx + gy * gy);
        count++;
      }
    }

    const avg = count > 0 ? edgeSum / count : 0;
    return Math.min(1, avg / 40);
  }

  /**
   * Create a stylized reflection effect preset.
   */
  applyPreset(imageData: ImageData, preset: 'mirror' | 'crystal' | 'dream' | 'shadow'): ImageData {
    switch (preset) {
      case 'mirror':
        return this.process(imageData, {
          filterConfig: { brightness: 10, contrast: 1.1, saturation: 1.1 },
          mirrorHorizontal: true,
        }).reflected;

      case 'crystal':
        return this.process(imageData, {
          filterConfig: { brightness: 20, contrast: 1.2, saturation: 1.3, edgeStrength: 1.2 },
          apply5D: true,
          depth: 0.3,
        }).reflected;

      case 'dream':
        return this.process(imageData, {
          filterConfig: { brightness: 5, contrast: 0.9, saturation: 1.2, blurRadius: 2 },
          apply5D: true,
          depth: 0.6,
        }).reflected;

      case 'shadow':
        return this.process(imageData, {
          filterConfig: { brightness: -30, contrast: 1.3, saturation: 0.5 },
          mirrorHorizontal: true,
        }).reflected;

      default:
        return imageData;
    }
  }

  getFilter(): ReflectionFilter {
    return this.filter;
  }

  updateConfig(config: Partial<FilterConfig>): void {
    this.filter.updateConfig(config);
  }

  getConfig(): FilterConfig {
    return this.filter.getConfig();
  }
}
